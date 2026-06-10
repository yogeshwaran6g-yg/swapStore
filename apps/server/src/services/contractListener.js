import { createPublicClient, http, parseAbiItem } from 'viem';
import { bsc, polygon, mainnet } from 'viem/chains';
import { queryRunner } from '../config/db.js';

// Placeholder addresses for INRSwapGateway - MUST update in production
const CONTRACT_ADDRESSES = {
  bsc: process.env.BSC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000001',
  polygon: process.env.POLYGON_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000002',
  mainnet: process.env.MAINNET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000003',
};

const swapRequestedEvent = parseAbiItem(
  'event SwapRequested(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

export const startContractListeners = () => {
  console.log('🎧 Starting smart contract listeners for SwapRequested events...');

  const networks = [
    { name: 'bsc', chain: bsc, address: CONTRACT_ADDRESSES.bsc },
    { name: 'polygon', chain: polygon, address: CONTRACT_ADDRESSES.polygon },
    { name: 'mainnet', chain: mainnet, address: CONTRACT_ADDRESSES.mainnet }
  ];

  networks.forEach(({ name, chain, address }) => {
    // Skip if address is not configured/is empty or placeholder
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      console.log(`⚠️ Skipping listener for ${name}: Contract address not configured.`);
      return;
    }

    try {
      const publicClient = createPublicClient({
        chain,
        transport: http(),
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
              // Convert bytes32 to a format suitable for BINARY(16) matching if needed
              // The DB stores order_id as BINARY(16), which corresponds to the first 32 chars (16 bytes) 
              // of the orderId string (after '0x').
              const hexId = orderId.substring(2, 34); // Extract the 32 hex chars (16 bytes)

              const result = await queryRunner(
                `UPDATE swap_orders 
                 SET status = 'completed', tx_hash = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = UNHEX(?) AND status = 'pending'`,
                [txHash, hexId]
              );

              if (result.affectedRows > 0) {
                console.log(`🎉 Order ${hexId} marked as completed in database!`);
                // TODO: Here you could trigger the actual INR bank transfer logic
              } else {
                console.log(`⚠️ Order ${hexId} not found in pending state. (Maybe already processed)`);
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
