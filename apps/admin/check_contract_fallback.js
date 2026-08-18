import { createPublicClient, http } from 'viem';
import { bsc, polygon } from 'viem/chains';

const bscClient = createPublicClient({
  chain: bsc,
  transport: http()
});

const ABI = [{
  name: 'getConfig',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [
    { name: 'owner_',          type: 'address' },
    { name: 'admin_',          type: 'address' },
    { name: 'loanWallet_',     type: 'address' },
    { name: 'interestWallet_', type: 'address' },
    { name: 'feeWallet_',      type: 'address' },
    { name: 'paused_',         type: 'bool'    },
  ],
}];

async function check() {
  try {
    const data = await bscClient.readContract({
      address: '0xfaa09C346475BaB145151d5DAF2c4f452Dc66a59',
      abi: ABI,
      functionName: 'getConfig'
    });
    console.log("SUCCESS:", data);
  } catch (error) {
    console.error("ERROR BSC:", error.message);
  }
}

check();
