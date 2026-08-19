import { createPublicClient, http, fallback, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';
import dotenv from 'dotenv';
dotenv.config();

const rpcUrl = process.env.POLYGON_RPC_URL;
const rpcUrls = rpcUrl ? rpcUrl.split(',').map(u => u.trim()).filter(Boolean) : [];
const transport = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();

const publicClient = createPublicClient({
  chain: polygon,
  transport: transport
});

const swapRequestedEvent = parseAbiItem(
  'event SwapRequested(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

console.log("Listening for SwapRequested events...");

const unwatch = publicClient.watchEvent({
  address: '0x75402765B77b32E66157E0E7814596d199F5E0b2',
  event: swapRequestedEvent,
  pollingInterval: 3000,
  onError: (err) => console.error("WatchEvent Error:", err),
  onLogs: logs => console.log("Logs received:", logs)
});

// Run for 30 seconds
setTimeout(() => {
  console.log("Stopping listener test.");
  unwatch();
  process.exit(0);
}, 30000);
