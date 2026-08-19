import { createPublicClient, http, fallback, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';
import dotenv from 'dotenv';
dotenv.config();

const publicClient = createPublicClient({
  chain: polygon,
  transport: http('https://polygon-bor-rpc.publicnode.com')
});

const swapRequestedEvent = parseAbiItem(
  'event SwapRequested(bytes32 indexed orderId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
);

console.log("Listening with poll: true...");

const unwatch = publicClient.watchEvent({
  address: '0x75402765B77b32E66157E0E7814596d199F5E0b2',
  event: swapRequestedEvent,
  poll: true,
  pollingInterval: 3000,
  onError: (err) => console.error("WatchEvent Error:", err),
  onLogs: logs => console.log("Logs received:", logs)
});

setTimeout(() => {
  unwatch();
  process.exit(0);
}, 10000);
