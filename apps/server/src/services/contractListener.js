import { createPublicClient, http, fallback, parseAbiItem } from 'viem';
import { bsc, polygon, mainnet } from 'viem/chains';
import { queryRunner } from '../config/db.js';

// Placeholder addresses for INRSwapGateway - MUST update in production
const CONTRACT_ADDRESSES = {
  bsc: process.env.BSC_CONTRACT_ADDRESS || '0xE6c3d9faeB15e97EA8d12434B638b11e17eB3425',
  polygon: process.env.POLYGON_CONTRACT_ADDRESS || '0x901e857B3d9EB2B180970A1105330EF43F4a9eF2',
  // mainnet: process.env.MAINNET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
};

const swapRequestedEvent = parseAbiItem(
  'event SwapRequested(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

export const startContractListeners = () => {
  console.log('🎧 Starting smart contract listeners for SwapRequested events...');

  const networks = [
    { name: 'bsc', chain: bsc, address: CONTRACT_ADDRESSES.bsc, rpcUrl: process.env.BSC_RPC_URL },
    { name: 'polygon', chain: polygon, address: CONTRACT_ADDRESSES.polygon, rpcUrl: process.env.POLYGON_RPC_URL },
    // { name: 'mainnet', chain: mainnet, address: CONTRACT_ADDRESSES.mainnet, rpcUrl: process.env.MAINNET_RPC_URL }
  ];

  networks.forEach(({ name, chain, address, rpcUrl }) => {
    // Skip if address is not configured/is empty or placeholder
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      console.log(`⚠️ Skipping listener for ${name}: Contract address not configured.`);
      return;
    }

    try {
      const rpcUrls = rpcUrl ? rpcUrl.split(',').map(url => url.trim()) : [];
      const transportConfig = rpcUrls.length > 0 
        ? fallback(rpcUrls.map(url => http(url)))
        : http();

      const publicClient = createPublicClient({
        chain,
        transport: transportConfig,
      });

      publicClient.watchEvent({
        address: address,
        event: swapRequestedEvent,
        onLogs: async (logs) => {
          for (const log of logs) {
            const { orderId, user, token, amount, timestamp } = log.args;
            const txHash = log.transactionHash;

            console.log(`✅ [${name}] SwapRequested Event Received!`);
            console.log(`   OrderID: ${orderId}`);
            console.log(`   User: ${user}`);
            console.log(`   Token: ${token}`);
            console.log(`   Amount: ${amount}`);
            console.log(`   TxHash: ${txHash}`);

            try {
              // 1. Verify the transaction's destination address
              const tx = await publicClient.getTransaction({ hash: txHash });
              if (!tx || tx.to.toLowerCase() !== address.toLowerCase()) {
                console.error(`❌ Tx ${txHash} did not interact directly with our Gateway Contract (${address}). Ignoring.`);
                continue; // Skip processing
              }

              // 2. Update database
              const hexId = orderId.substring(2); // Full 64 hex chars (32 bytes) to match BINARY(32) column

              const result = await queryRunner(
                `UPDATE swap_orders 
                 SET user_crypto_payment_status = 'completed', tx_hash = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = UNHEX(?) AND user_crypto_payment_status = 'initiated'`,
                [txHash, hexId]
              );

              if (result && result.affectedRows > 0) {
                console.log(`🎉 Order ${hexId} marked as completed in database!`);
                // TODO: Here you could trigger the actual INR bank transfer logic
              } else {
                console.log(`⚠️ Order ${hexId} not found in initiated state. (Maybe already processed)`);
              }
            } catch (dbErr) {
              console.error(`❌ DB Error updating order ${orderId}:`, dbErr);
            }
          }
        },
      });

      console.log(`✅ Listening on ${name} at ${address}`);
    } catch (err) {
      console.error(`❌ Failed to start listener for ${name}:`, err);
    }
  });
};
