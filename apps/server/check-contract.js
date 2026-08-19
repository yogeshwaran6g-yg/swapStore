import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({
  chain: polygon,
  transport: http()
});

const ERC20_ABI = [
  { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }
];

const CONTRACT_ADDRESS = '0x6BCa1F5fca15e15980a8F3bF9664ad733cF29F15';
const TEST_USDT_ADDRESS = '0xEae2DaD7A955840F3A70B90F118d2B8183b579DD';

async function check() {
  try {
    const balance = await client.readContract({
      address: TEST_USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [CONTRACT_ADDRESS]
    });
    console.log('Test USDT Balance of contract:', balance.toString(), `(which is ${Number(balance)/1e6} USDT assuming 6 decimals)`);
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
