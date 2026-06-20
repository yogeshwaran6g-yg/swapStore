import { createPublicClient, http, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';
import dotenv from 'dotenv';
dotenv.config();

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(process.env.POLYGON_RPC_URL ? process.env.POLYGON_RPC_URL.split(',')[0].trim() : undefined)
});

const swapRequestedEvent = parseAbiItem(
  'event SwapRequested(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

const startManualPolling = async (publicClient, address, eventsConfig, pollInterval = 4000) => {
  let lastBlock = 0n;
  setInterval(async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();
      console.log("Current block:", currentBlock);
      if (lastBlock === 0n) { 
        lastBlock = currentBlock - 50n; // look back 50 blocks just for test!
      }
      if (currentBlock <= lastBlock) return;

      const fromBlock = lastBlock + 1n;
      let toBlock = currentBlock;
      if (toBlock - fromBlock > 500n) toBlock = fromBlock + 500n; // limit range

      console.log(`Polling blocks ${fromBlock} to ${toBlock}`);

      for (const config of eventsConfig) {
        try {
          const logs = await publicClient.getLogs({ address, event: config.event, fromBlock, toBlock });
          if (logs.length > 0) {
             console.log("Found logs!!", logs.length);
             config.onLogs(logs).catch(e => console.error("Error processing logs:", e));
          }
        } catch (e) {
          console.error("Error fetching logs:", e.message);
        }
      }
      lastBlock = toBlock;
    } catch (err) {
      console.error("Error getting block number:", err.message);
    }
  }, pollInterval);
};

startManualPolling(publicClient, '0x75402765B77b32E66157E0E7814596d199F5E0b2', [{
  event: swapRequestedEvent,
  onLogs: async (logs) => { console.log(logs); }
}]);
