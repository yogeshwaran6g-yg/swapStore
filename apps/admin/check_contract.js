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
      address: '0x1ba8BC86D617E24EB75989FAB3103E685e250FA3',
      abi: ABI,
      functionName: 'getConfig'
    });
    console.log("SUCCESS:", data);
  } catch (error) {
    console.error("ERROR BSC:", error.message);
  }

  try {
    const polygonClient = createPublicClient({
      chain: polygon,
      transport: http()
    });
    const data = await polygonClient.readContract({
      address: '0xD197Ea7504135Baa737a56BC190352Aca1D27bCc',
      abi: ABI,
      functionName: 'getConfig'
    });
    console.log("SUCCESS POLYGON:", data);
  } catch (error) {
    console.error("ERROR POLYGON:", error.message);
  }
}

check();
