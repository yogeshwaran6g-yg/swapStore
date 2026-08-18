import { createPublicClient, http, fallback, parseAbiItem } from 'viem';
import { bsc, polygon } from 'viem/chains';
import { queryRunner } from '../config/db.js';
import { getSystemSettings, resolveInterestCollection } from './loanService.js';
// ── Swap Gateway Contract Addresses ────────────────────────────────────────
const SWAP_CONTRACT_ADDRESSES = {
  bsc:     process.env.BSC_CONTRACT_ADDRESS     || '0xE6c3d9faeB15e97EA8d12434B638b11e17eB3425',
  polygon: process.env.POLYGON_CONTRACT_ADDRESS || '0x901e857B3d9EB2B180970A1105330EF43F4a9eF2',
};

// ── Loan Contract Addresses ─────────────────────────────────────────────────
const LOAN_CONTRACT_ADDRESSES = {
  bsc:     process.env.BSC_LOAN_CONTRACT_ADDRESS     || '',
  polygon: process.env.POLYGON_LOAN_CONTRACT_ADDRESS || '',
};

// ── Swap Events ─────────────────────────────────────────────────────────────
const swapRequestedEvent = parseAbiItem(
  'event SwapRequested(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

// ── Loan Events ─────────────────────────────────────────────────────────────

const paymentCollectedEvent = parseAbiItem(
  'event PaymentCollected(bytes32 indexed loanId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

const paymentSkippedEvent = parseAbiItem(
  'event PaymentSkipped(bytes32 indexed loanId, address indexed user, address indexed token, uint256 timestamp)'
);

const principalRepaidEvent = parseAbiItem(
  'event PrincipalRepaid(bytes32 indexed loanId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

const loanClosedEvent = parseAbiItem(
  'event LoanClosed(bytes32 indexed loanId, address indexed user, uint8 reason, uint256 timestamp)'
);

// ── Helper: create public client ────────────────────────────────────────────
const buildClient = (chain, rpcUrl) => {
  const rpcUrls = rpcUrl ? rpcUrl.split(',').map(u => u.trim()).filter(Boolean) : [];
  // Use the first reliable node instead of fallback to avoid split state issues, or just use http with all URLs
  const transport = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();
  return createPublicClient({ chain, transport });
};

// ── Robust Manual Poller for Public RPCs ────────────────────────────────────
// Public RPCs behind load balancers often fail with eth_newFilter ('filter not found').
// This manual poller strictly uses stateless eth_getLogs for 100% reliability.
const startManualPolling = async (publicClient, address, eventsConfig, pollInterval = 8000) => {
  let lastBlock = 0n;
  
  const poll = async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();
      if (lastBlock === 0n) { lastBlock = currentBlock; }
      else if (currentBlock > lastBlock) {
        
        // Anti-Archive Protection: If we fall behind by more than 100 blocks,
        // free public RPCs (like Polygon's 128-block limit) will reject our getLogs request.
        // To recover, we MUST fast-forward the listener to the recent blocks.
        if (currentBlock - lastBlock > 100n) {
          console.warn(`[ManualPolling] Fast-forwarding listener to prevent Archive Node error! Skipped blocks from ${lastBlock} to ${currentBlock - 50n}`);
          lastBlock = currentBlock - 50n;
        }

        const fromBlock = lastBlock + 1n;
        let toBlock = currentBlock;
        if (toBlock - fromBlock > 50n) toBlock = fromBlock + 50n; // limit range to 50 blocks for strict RPCs

        let successCount = 0;
        for (const config of eventsConfig) {
          try {
            const logs = await publicClient.getLogs({ address, event: config.event, fromBlock, toBlock });
            if (Array.isArray(logs) && logs.length > 0) {
              config.onLogs(logs).catch(e => console.error("Error processing logs:", e));
            }
            successCount++;
          } catch (e) {
            if (!e.message?.includes('logs.map')) {
              console.error(`[ManualPolling] getLogs error for ${address}:`, e.message);
            }
          }
        }
        
        // Only advance lastBlock if ALL events were successfully fetched
        // If an RPC rate limit happens, we retry the exact same block range next time!
        if (successCount === eventsConfig.length) {
          lastBlock = toBlock;
        } else {
          console.error(`[ManualPolling] Skipping block advance due to RPC errors. Will retry range ${fromBlock}-${toBlock}`);
        }
      }
    } catch (err) {
      console.error(`[ManualPolling] Block number error:`, err.message);
    }
    setTimeout(poll, pollInterval);
  };
  
  poll();
};

// ── Swap Listener ───────────────────────────────────────────────────────────
const startSwapListeners = (networks) => {
  networks.forEach(({ name, chain, rpcUrl }) => {
    const address = SWAP_CONTRACT_ADDRESSES[name];
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      console.log(`⚠️  [Swap] Skipping ${name}: contract address not configured.`);
      return;
    }

    try {
      const publicClient = buildClient(chain, rpcUrl);

      startManualPolling(publicClient, address, [
        {
          event: swapRequestedEvent,
          onLogs: async (logs) => {
            for (const log of logs) {
              const { orderId, user, token, amount } = log.args;
              const txHash = log.transactionHash;
              console.log(`✅ [Swap/${name}] SwapRequested | orderId=${orderId} user=${user}`);

              try {
                const tx = await publicClient.getTransaction({ hash: txHash });
                if (!tx || tx.to?.toLowerCase() !== address.toLowerCase()) {
                  console.error(`❌ [Swap/${name}] Tx ${txHash} not directed at our contract. Ignoring.`);
                  continue;
                }

                const hexId = orderId.substring(2);
                const result = await queryRunner(
                  `UPDATE swap_orders 
                   SET user_crypto_payment_status = 'completed', tx_hash = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE order_id = UNHEX(?) AND user_crypto_payment_status = 'initiated'`,
                  [txHash, hexId]
                );

                if (result?.affectedRows > 0) {
                  console.log(`🎉 [Swapstore's  swap/${name}] Order ${hexId} marked completed.`);
                } else {
                  console.log(`⚠️  [Swap/${name}] Order ${hexId} not found/already processed.`);
                }
              } catch (err) {
                console.error(`❌ [Swap/${name}] DB error for order ${orderId}:`, err.message);
              }
            }
          }
        }
      ]);

      console.log(`✅ [Swap] Listening on ${name} at ${address}`);
    } catch (err) {
      console.error(`❌ [Swap] Failed to start listener for ${name}:`, err.message);
    }
  });
};

// ── Loan Listeners ──────────────────────────────────────────────────────────
const startLoanListeners = (networks) => {
  networks.forEach(({ name, chain, rpcUrl }) => {
    const address = LOAN_CONTRACT_ADDRESSES[name];
    if (!address || address === '0x0000000000000000000000000000000000000000' || address === '') {
      console.log(`⚠️  [Loan] Skipping ${name}: loan contract address not configured.`);
      return;
    }

    try {
      const publicClient = buildClient(chain, rpcUrl);

      startManualPolling(publicClient, address, [

        {
          event: paymentCollectedEvent,
          onLogs: async (logs) => {
            for (const log of logs) {
              const { loanId, user, amount } = log.args;
              const txHash = log.transactionHash;
              const hexLoanId = loanId.substring(2);
              console.log(`💸 [Loan/${name}] PaymentCollected | loanId=${hexLoanId} amount=${amount}`);

              try {
                const humanAmount = Number(amount) / 1e18;
                const ledgers = await queryRunner(
                  `SELECT id FROM loan_interest_ledger 
                   WHERE loan_uid = (SELECT uid FROM loans WHERE loan_id = UNHEX(?) LIMIT 1)
                     AND collection_status = 'collecting'
                   ORDER BY id DESC LIMIT 1`,
                  [hexLoanId]
                );

                if (ledgers && ledgers.length > 0) {
                  await resolveInterestCollection(ledgers[0].id, 'collected', humanAmount, txHash);
                  console.log(`🎉 [Loan/${name}] Loan ${hexLoanId} interest +${humanAmount} processed via shared resolver.`);
                } else {
                  console.log(`⚠️  [Loan/${name}] No 'collecting' ledger found for Loan ${hexLoanId}.`);
                }
              } catch (err) {
                console.error(`❌ [Loan/${name}] DB error for PaymentCollected ${loanId}:`, err.message);
              }
            }
          }
        },
        {
          event: paymentSkippedEvent,
          onLogs: async (logs) => {
            for (const log of logs) {
              const { loanId, user } = log.args;
              const hexLoanId = loanId.substring(2);
              console.log(`⚠️  [Loan/${name}] PaymentSkipped (zero balance/allowance) | loanId=${hexLoanId} user=${user}`);

              try {
                const txHash = log.transactionHash;
                const ledgers = await queryRunner(
                  `SELECT id FROM loan_interest_ledger 
                   WHERE loan_uid = (SELECT uid FROM loans WHERE loan_id = UNHEX(?) LIMIT 1)
                     AND collection_status = 'collecting'
                   ORDER BY id DESC LIMIT 1`,
                  [hexLoanId]
                );

                if (ledgers && ledgers.length > 0) {
                  await resolveInterestCollection(ledgers[0].id, 'missed', 0, txHash);
                  console.log(`📋 [Loan/${name}] Loan ${hexLoanId} interest marked as missed (insufficient funds).`);
                } else {
                  console.log(`⚠️  [Loan/${name}] No 'collecting' ledger found for Loan ${hexLoanId} skip event.`);
                }
              } catch (err) {
                console.error(`❌ [Loan/${name}] DB error for PaymentSkipped ${loanId}:`, err.message);
              }
            }
          }
        },
        {
          event: principalRepaidEvent,
          onLogs: async (logs) => {
            for (const log of logs) {
              const { loanId, user, amount } = log.args;
              const txHash = log.transactionHash;
              const hexLoanId = loanId.substring(2);
              console.log(`🔄 [Loan/${name}] PrincipalRepaid | loanId=${hexLoanId} amount=${amount}`);

              try {
                // Idempotency check — skip if already processed via frontend API
                const existing = await queryRunner(
                  `SELECT id FROM loan_principal_payments WHERE tx_hash = ? LIMIT 1`,
                  [txHash]
                );
                if (existing && existing.length > 0) {
                  console.log(`⏭️  [Loan/${name}] PrincipalRepaid ${txHash} already recorded, skipping.`);
                  continue;
                }

                const humanAmount = Number(amount) / 1e18;

                // Fetch the loan to get snapshot values
                const loanRows = await queryRunner(
                  `SELECT HEX(uid) as uid, HEX(user_uid) as user_uid, outstanding_principal,
                          wallet_address, token_symbol, network
                   FROM loans WHERE loan_id = UNHEX(?) LIMIT 1`,
                  [hexLoanId]
                );

                if (loanRows && loanRows.length > 0) {
                  const loan = loanRows[0];
                  const principalBefore = Number(loan.outstanding_principal);
                  const principalAfter  = Math.max(0, principalBefore - humanAmount);

                  await queryRunner(
                    `INSERT INTO loan_principal_payments
                     (loan_uid, user_uid, payment_amount, principal_before, principal_after, tx_hash,
                      wallet_address, token_symbol, network, payment_status, payment_source, confirmed_at)
                     VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'user_initiated', NOW())`,
                    [loan.uid, loan.user_uid, humanAmount, principalBefore, principalAfter,
                     txHash, loan.wallet_address, loan.token_symbol, loan.network]
                  );
                }

                await queryRunner(
                  `UPDATE loans 
                   SET total_principal_paid = total_principal_paid + ?,
                       outstanding_principal = GREATEST(0, outstanding_principal - ?),
                       updated_at = NOW()
                   WHERE loan_id = UNHEX(?)`,
                  [humanAmount, humanAmount, hexLoanId]
                );
                console.log(`🎉 [Loan/${name}] Principal repayment of ${humanAmount} recorded via listener for loan ${hexLoanId}.`);
              } catch (err) {
                console.error(`❌ [Loan/${name}] DB error for PrincipalRepaid ${loanId}:`, err.message);
              }
            }
          }
        },
        {
          event: loanClosedEvent,
          onLogs: async (logs) => {
            for (const log of logs) {
              const { loanId, reason } = log.args;
              const hexLoanId = loanId.substring(2);
              const statusMap = { 0: 'repaid', 1: 'defaulted', 2: 'closed' };
              const newStatus = statusMap[Number(reason)] || 'closed';
              console.log(`🔒 [Loan/${name}] LoanClosed | loanId=${hexLoanId} reason=${reason} → status=${newStatus}`);

              try {
                await queryRunner(
                  `UPDATE loans SET status = ?, closed_at = NOW(), updated_at = NOW() WHERE loan_id = UNHEX(?)`,
                  [newStatus, hexLoanId]
                );
                console.log(`🎉 [Loan/${name}] Loan ${hexLoanId} closed with status '${newStatus}'.`);
              } catch (err) {
                console.error(`❌ [Loan/${name}] DB error for LoanClosed ${loanId}:`, err.message);
              }
            }
          }
        }
      ]);

      console.log(`✅ [Loan] Listening on ${name} at ${address}`);
    } catch (err) {
      console.error(`❌ [Loan] Failed to start listener for ${name}:`, err.message);
    }
  });
};

// ── Main Export ─────────────────────────────────────────────────────────────
export const startContractListeners = () => {
  console.log('🎧 Starting smart contract listeners...');

  const networks = [
    { name: 'bsc',     chain: bsc,     rpcUrl: process.env.BSC_RPC_URL },
    { name: 'polygon', chain: polygon,  rpcUrl: process.env.POLYGON_RPC_URL },
  ];

  startSwapListeners(networks);
  startLoanListeners(networks);
};
