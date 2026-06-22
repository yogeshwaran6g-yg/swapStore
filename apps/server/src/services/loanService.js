import { v4 as uuidv4 } from 'uuid';
import { queryRunner } from '../config/db.js';
import { returnServiceResponse } from '../utils/responseUtils.js';
import { createPublicClient, createWalletClient, http, fallback, parseAbiItem, parseUnits, parseAbi, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc, polygon } from 'viem/chains';

const ERC20_ABI = [
  parseAbiItem('function balanceOf(address owner) view returns (uint256)'),
  parseAbiItem('function decimals() view returns (uint8)')
];

const LOAN_ABI = parseAbi([
  'function collectPayment(bytes32 loanId, address user, address token, uint256 amount) external',
  'event PaymentCollected(bytes32 indexed loanId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)',
  'event PaymentSkipped(bytes32 indexed loanId, address indexed user, address indexed token, uint256 timestamp)'
]);

const LOAN_CONTRACT_ADDRESSES = {
  bsc:     process.env.BSC_LOAN_CONTRACT_ADDRESS     || '',
  polygon: process.env.POLYGON_LOAN_CONTRACT_ADDRESS || '',
};

/**
 * Build a viem walletClient signed by the collector/admin private key.
 * Returns null if ADMIN_PRIVATE_KEY is not set.
 */
export const getCollectorWalletClient = (network = 'bsc') => {
  const pk = process.env.ADMIN_PRIVATE_KEY;
  if (!pk) {
    console.warn('⚠️  ADMIN_PRIVATE_KEY not set — on-chain collection disabled.');
    return null;
  }
  const chain = network === 'bsc' ? bsc : polygon;
  const rpcStr = network === 'bsc' ? process.env.BSC_RPC_URL : process.env.POLYGON_RPC_URL;
  const rpcUrls = rpcStr ? rpcStr.split(',').map(u => u.trim()).filter(Boolean) : [];
  const transport = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();
  const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);
  return createWalletClient({ account, chain, transport });
};

/**
 * Gets on-chain balance of a token for a user.
 */
export const getTokenBalance = async (walletAddress, tokenAddress, network) => {
  try {
    const chainConfig = network === 'bsc' ? bsc : polygon;
    const rpcUrlStr = network === 'bsc' ? process.env.BSC_RPC_URL : process.env.POLYGON_RPC_URL;
    const rpcUrls = rpcUrlStr ? rpcUrlStr.split(',').map(u => u.trim()).filter(Boolean) : [];

    const transport = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();

    const publicClient = createPublicClient({
      chain: chainConfig,
      transport: transport,
    });

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress]
    });

    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });

    // Use BigInt division to avoid precision loss on 18-decimal tokens with large balances
    const divisor = BigInt(10) ** BigInt(decimals);
    return Number((balance * BigInt(1_000_000_000)) / divisor) / 1_000_000_000;
  } catch (error) {
    console.error('Error fetching on-chain balance:', error);
    return 0;
  }
}

/**
 * Fetch a system_settings value by key.
 */
export const getSystemSettings = async (key) => {
  try {
    const rows = await queryRunner(`SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1`, [key]);
    if (rows && rows.length > 0) return rows[0].setting_value;
    return null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}

/**
 * Upload KYC document.
 */
export const uploadKyc = async (userUid, fileUrl, documentType) => {
  try {
    const result = await queryRunner(
      `INSERT INTO user_kyc_documents (user_uid, document_type, document_url, status) VALUES (UNHEX(?), ?, ?, 'pending')`,
      [userUid, documentType, fileUrl]
    );

    if (result && result.affectedRows > 0) {
      await queryRunner(`UPDATE users SET kyc_status = 'submitted' WHERE uid = UNHEX(?)`, [userUid]);
      return returnServiceResponse(true);
    }
    return returnServiceResponse(false, null, 'Failed to save KYC document');
  } catch (error) {
    return returnServiceResponse(false, null, error.message);
  }
};

/**
 * Request a new loan with tier-based eligibility validation.
 */
export const requestLoan = async (userUid, principalAmount, walletAddress, tokenAddress, network) => {
  try {
    // 1. Verify KYC
    const kycCheck = await queryRunner(`SELECT kyc_status FROM users WHERE uid = UNHEX(?) LIMIT 1`, [userUid]);
    if (!kycCheck || kycCheck.length === 0 || kycCheck[0].kyc_status !== 'approved') {
      return returnServiceResponse(false, null, 'KYC must be approved to request a loan');
    }

    // 2. Load eligibility tiers from system_settings
    const tiersStr = await getSystemSettings('loan_eligibility_tiers');
    let tiers = [];
    try {
      if (tiersStr) tiers = JSON.parse(tiersStr);
    } catch (e) {
      console.error('Error parsing loan_eligibility_tiers:', e);
    }

    // 3. Filter tiers applicable to this network
    const applicableTiers = tiers.filter(t => t.network.toLowerCase() === network.toLowerCase());
    if (applicableTiers.length === 0) {
      return returnServiceResponse(false, null, 'No loan tiers configured for this network');
    }

    // 4. Check on-chain balance
    const balance = await getTokenBalance(walletAddress, tokenAddress, network);

    // 5. Find the best matching tier
    let maxAllowedLoan = 0;
    let matchedTier = null;
    for (const tier of applicableTiers) {
      if (balance >= tier.min_balance && tier.max_loan > maxAllowedLoan) {
        maxAllowedLoan = tier.max_loan;
        matchedTier = tier;
      }
    }

    if (!matchedTier) {
      return returnServiceResponse(false, null, `Insufficient token balance. You hold ${balance.toFixed(4)} but need at least ${Math.min(...applicableTiers.map(t => t.min_balance))}.`);
    }

    if (Number(principalAmount) > maxAllowedLoan) {
      return returnServiceResponse(false, null, `Requested amount exceeds your maximum allowed loan of $${maxAllowedLoan}.`);
    }

    // 6. Load settings
    const interestRate = Number(await getSystemSettings('loan_interest_rate')) || 5.0;
    const termDays = Number(await getSystemSettings('loan_default_term_days')) || 30;
    const frequencyDays = Number(await getSystemSettings('loan_interest_frequency_days')) || 30;

    // 7. Create loan record
    const loanUid = uuidv4().replace(/-/g, '');
    const loanIdStr = uuidv4();
    const hexLoanId = loanIdStr.replace(/-/g, '');

    const now = new Date();
    const maturityDate = new Date(now.getTime() + termDays * 24 * 60 * 60 * 1000);
    const nextDebitDate = new Date(now.getTime() + frequencyDays * 24 * 60 * 60 * 1000);

    const insertResult = await queryRunner(
      `INSERT INTO loans 
       (uid, user_uid, loan_id, principal_amount, outstanding_principal, interest_rate, 
        token_symbol, token_address, network, loan_term_days, maturity_date, next_debit_date, status) 
       VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [loanUid, userUid, hexLoanId, principalAmount, principalAmount, interestRate,
       matchedTier.token, tokenAddress, network, termDays, maturityDate, nextDebitDate]
    );

    if (insertResult && insertResult.affectedRows > 0) {
      return returnServiceResponse(true, { loanId: hexLoanId, loanUid });
    }
    return returnServiceResponse(false, null, 'Failed to request loan');
  } catch (error) {
    console.error('Error in requestLoan:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

/**
 * Get all loans for a user.
 */
export const getMyLoans = async (userUid) => {
  try {
    const loans = await queryRunner(
      `SELECT HEX(uid) as uid, HEX(loan_id) as loan_id, principal_amount, outstanding_principal,
              interest_rate, token_symbol, token_address, network, 
              total_interest_paid, total_principal_paid,
              is_overdue, overdue_since, loan_term_days, maturity_date,
              status, next_debit_date, disbursed_at, closed_at, created_at 
       FROM loans WHERE user_uid = UNHEX(?) ORDER BY created_at DESC`,
      [userUid]
    );

    const ledgers = await queryRunner(
      `SELECT id, HEX(loan_uid) as loan_uid, interest_amount, interest_rate, principal_at_time, 
              period_start, period_end, collection_status, tx_hash, failure_reason, collected_at, created_at
       FROM loan_interest_ledger WHERE user_uid = UNHEX(?) ORDER BY created_at DESC`,
      [userUid]
    );

    const loansWithLedger = loans.map((loan) => {
      loan.ledger = ledgers.filter((l) => l.loan_uid === loan.uid);
      return loan;
    });

    return returnServiceResponse(true, { loans: loansWithLedger });
  } catch (error) {
    return returnServiceResponse(false, null, error.message);
  }
};

/**
 * Collect interest for a single loan and record in the ledger.
 * Returns { success, interestAmount, txHash, failureReason }
 */
export const collectInterestForLoan = async (loan, cronRunId = null) => {
  const interestRate = Number(loan.interest_rate);
  // Always calculate interest on the original loaned amount
  const principal = Number(loan.principal_amount);

  const interestAmount = (principal * interestRate) / 100;

  const now = new Date();
  const frequencyDays = Number(await getSystemSettings('loan_interest_frequency_days')) || 30;
  const periodStart = new Date(now.getTime() - frequencyDays * 24 * 60 * 60 * 1000);

  // Insert interest ledger entry (collecting)
  const ledgerResult = await queryRunner(
    `INSERT INTO loan_interest_ledger 
     (loan_uid, user_uid, interest_amount, interest_rate, principal_at_time, 
      period_start, period_end, collection_status, wallet_address, token_symbol, network, cron_run_id)
     VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, 'collecting', ?, ?, ?, ?)`,
    [loan.uid, loan.user_uid, interestAmount, interestRate, principal,
     periodStart, now, loan.wallet_address, loan.token_symbol, loan.network, cronRunId]
  );
  const ledgerId = ledgerResult.insertId;

  // ── Attempt on-chain collection ─────────────────────────────────────────
  const contractAddress = LOAN_CONTRACT_ADDRESSES[loan.network];
  const walletClient = getCollectorWalletClient(loan.network);

  if (!contractAddress || !walletClient) {
    // Fallback: simulate (no contract / no key configured)
    console.warn(`⚠️  On-chain collection not configured for ${loan.network} — recording as simulated.`);
    try {
      const nextDebit = new Date(now.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
      await queryRunner(
        `UPDATE loan_interest_ledger SET collection_status = 'collected', collected_at = NOW() WHERE id = ?`,
        [ledgerId]
      );
      await queryRunner(
        `UPDATE loans SET total_interest_paid = total_interest_paid + ?, next_debit_date = ?, updated_at = NOW() WHERE uid = UNHEX(?)`,
        [interestAmount, nextDebit, loan.uid]
      );
      return { success: true, interestAmount, txHash: null, failureReason: 'simulated (no contract configured)' };
    } catch (err) {
      await queryRunner(
        `UPDATE loan_interest_ledger SET collection_status = 'failed', failure_reason = ? WHERE id = ?`,
        [err.message, ledgerId]
      );
      return { success: false, interestAmount, txHash: null, failureReason: err.message };
    }
  }

  try {
    // Convert interestAmount (human-readable) to on-chain units (token decimals via 18)
    const amountWei = parseUnits(interestAmount.toFixed(18), 18);
    const loanIdBytes32 = loan.loan_id.startsWith('0x') ? loan.loan_id : `0x${loan.loan_id}`;

    // Mark ledger as collecting — listener will update to 'collected' + tx_hash when the tx confirms
    await queryRunner(
      `UPDATE loan_interest_ledger SET collection_status = 'collecting' WHERE id = ?`,
      [ledgerId]
    );

    // Call on-chain collectPayment
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: LOAN_ABI,
      functionName: 'collectPayment',
      args: [
        loanIdBytes32,
        loan.wallet_address,
        loan.token_address,
        amountWei,
      ],
    });

    console.log(`✅ On-chain collectPayment tx submitted: ${txHash}. Waiting for receipt...`);

    // Advance next_debit_date immediately so the cron doesn't re-queue this loan.
    // total_interest_paid is updated after receipt or by the listener.
    const nextDebit = new Date(now.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
    await queryRunner(
      `UPDATE loans SET next_debit_date = ?, updated_at = NOW() WHERE uid = UNHEX(?)`,
      [nextDebit, loan.uid]
    );

    // Wait for the transaction receipt immediately
    try {
      const chainConfig = loan.network === 'bsc' ? bsc : polygon;
      const rpcUrlStr = loan.network === 'bsc' ? process.env.BSC_RPC_URL : process.env.POLYGON_RPC_URL;
      const rpcUrls = rpcUrlStr ? rpcUrlStr.split(',').map(u => u.trim()).filter(Boolean) : [];
      const transport = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();
      const publicClient = createPublicClient({ chain: chainConfig, transport });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      let humanAmount = 0;
      let eventName = null;

      if (receipt.status === 'success') {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: LOAN_ABI,
              data: log.data,
              topics: log.topics
            });
            if (decoded.eventName === 'PaymentCollected' || decoded.eventName === 'PaymentSkipped') {
              eventName = decoded.eventName;
              if (decoded.eventName === 'PaymentCollected') {
                humanAmount = Number(decoded.args.amount) / 1e18;
              }
              break;
            }
          } catch (e) {
            // ignore logs not matching ABI
          }
        }

        if (eventName === 'PaymentCollected') {
          await resolveInterestCollection(ledgerId, 'collected', humanAmount, txHash);
          return { success: true, interestAmount: humanAmount, txHash, failureReason: null };
        } else if (eventName === 'PaymentSkipped') {
          await resolveInterestCollection(ledgerId, 'missed', 0, txHash);
          return { success: false, interestAmount: 0, txHash, failureReason: 'PaymentSkipped: Insufficient balance/allowance' };
        } else {
          await resolveInterestCollection(ledgerId, 'failed', 0, txHash);
          return { success: false, interestAmount: 0, txHash, failureReason: 'Unknown event in receipt logs' };
        }
      } else {
        await resolveInterestCollection(ledgerId, 'failed', 0, txHash);
        return { success: false, interestAmount: 0, txHash, failureReason: 'Transaction reverted' };
      }
    } catch (receiptErr) {
       console.error(`❌ Receipt error for tx ${txHash}:`, receiptErr);
       // Still return true so cron does not immediately fail it, leaving it in 'collecting' for listener.
       return { success: true, interestAmount: 0, txHash, failureReason: 'Receipt timeout/error, listener will handle' };
    }
  } catch (err) {
    await queryRunner(
      `UPDATE loan_interest_ledger SET collection_status = 'failed', failure_reason = ? WHERE id = ?`,
      [err.message, ledgerId]
    );
    return { success: false, interestAmount, txHash: null, failureReason: err.message };
  }
};

/**
 * Mark a loan as overdue.
 */
export const markLoanOverdue = async (loanUid) => {
  await queryRunner(
    `UPDATE loans 
     SET is_overdue = 1, overdue_since = COALESCE(overdue_since, NOW()), 
         overdue_count = overdue_count + 1, status = 'overdue', updated_at = NOW()
     WHERE uid = UNHEX(?)`,
    [loanUid]
  );
};

/**
 * Check if a loan has matured and auto-close if enabled.
 */
export const checkAndAutoCloseLoan = async (loan) => {
  const autoClose = (await getSystemSettings('loan_auto_close_on_maturity')) === '1';
  if (!autoClose) return false;

  const now = new Date();
  const maturity = new Date(loan.maturity_date);
  if (now >= maturity) {
    await queryRunner(
      `UPDATE loans SET status = 'closed', closed_at = NOW(), updated_at = NOW() WHERE uid = UNHEX(?)`,
      [loan.uid]
    );
    return true;
  }
  return false;
};

/**
 * Shared resolver for processing interest collection results.
 * Handles partial payments by splitting the ledger entry.
 */
export const resolveInterestCollection = async (ledgerId, status, humanAmount, txHash) => {
  try {
    const ledgers = await queryRunner(
      `SELECT id, HEX(loan_uid) as loan_uid, interest_amount FROM loan_interest_ledger
       WHERE id = ? AND collection_status = 'collecting'
       LIMIT 1`,
      [ledgerId]
    );

    if (!ledgers || ledgers.length === 0) {
      // Already resolved by cron/listener race condition or doesn't exist
      return;
    }

    const ledger = ledgers[0];
    const expectedAmount = Number(ledger.interest_amount);

    if (status === 'collected') {
      if (humanAmount < expectedAmount) {
        // Partial Payment
        const shortfall = expectedAmount - humanAmount;
        
        await queryRunner(
          `UPDATE loan_interest_ledger 
           SET collected_amount = ?, collection_status = 'partial', tx_hash = ?, collected_at = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [humanAmount, txHash, ledger.id]
        );

        // Add to total_interest_paid and pending_interest_due
        await queryRunner(
          `UPDATE loans 
           SET total_interest_paid = total_interest_paid + ?, 
               pending_interest_due = pending_interest_due + ?,
               updated_at = NOW()
           WHERE uid = UNHEX(?)`,
          [humanAmount, shortfall, ledger.loan_uid]
        );
      } else {
        // Full Payment
        await queryRunner(
          `UPDATE loan_interest_ledger 
           SET collected_amount = ?, collection_status = 'collected', tx_hash = ?, collected_at = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [humanAmount, txHash, ledger.id]
        );

        // Add to total_interest_paid
        await queryRunner(
          `UPDATE loans 
           SET total_interest_paid = total_interest_paid + ?, updated_at = NOW()
           WHERE uid = UNHEX(?)`,
          [humanAmount, ledger.loan_uid]
        );
      }
    } else if (status === 'missed') {
      await queryRunner(
        `UPDATE loan_interest_ledger 
         SET collection_status = 'skipped', tx_hash = ?, updated_at = NOW()
         WHERE id = ?`,
        [txHash, ledger.id]
      );
      
      // The entire amount is missed, add to pending_interest_due
      await queryRunner(
        `UPDATE loans 
         SET pending_interest_due = pending_interest_due + ?, updated_at = NOW()
         WHERE uid = UNHEX(?)`,
        [expectedAmount, ledger.loan_uid]
      );
    } else if (status === 'failed') {
      await queryRunner(
        `UPDATE loan_interest_ledger 
         SET collection_status = 'failed', failure_reason = ?, tx_hash = ?, updated_at = NOW()
         WHERE id = ?`,
        ['Transaction reverted or failed', txHash, ledger.id]
      );
    }
  } catch (err) {
    console.error('❌ Error in resolveInterestCollection:', err);
  }
};
