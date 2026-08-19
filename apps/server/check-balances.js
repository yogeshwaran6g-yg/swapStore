import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({
  chain: polygon,
  transport: http()
});

const ERC20_ABI = [
  { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
];

const TEST_USDT_ADDRESS = '0xEae2DaD7A955840F3A70B90F118d2B8183b579DD';
const USER_ADDRESS = '0xE0DA5de14A81cb8B794c1BAA0DB9a8fde787cc1A';
const ADMIN_ADDRESS = '0xaE1E80fFC6702fEb767fD203B2b51c7612e2337d';

async function check() {
  try {
    const userBalance = await client.readContract({
      address: TEST_USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [USER_ADDRESS]
    });
    console.log('User USDT Balance:', userBalance.toString(), `(${Number(userBalance)/1e6} USDT)`);

    const adminBalance = await client.readContract({
      address: TEST_USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [ADMIN_ADDRESS]
    });
    console.log('Admin USDT Balance:', adminBalance.toString(), `(${Number(adminBalance)/1e6} USDT)`);
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
