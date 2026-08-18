import { createPublicClient, http } from 'viem';
import { bsc, polygon } from 'viem/chains';

const polygonClient = createPublicClient({
  chain: polygon,
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
    const data = await polygonClient.readContract({
      address: '0x1ba8BC86D617E24EB75989FAB3103E685e250FA3', // BSC address queried on Polygon
      abi: ABI,
      functionName: 'getConfig'
    });
    console.log("SUCCESS:", data);
  } catch (error) {
    console.error("ERROR POLYGON (querying BSC addr):", error.message);
  }
}

check();
