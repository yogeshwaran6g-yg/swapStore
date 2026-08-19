import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({
  chain: polygon,
  transport: http()
});

const ERC20_ABI = [
  { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
  { "constant": true, "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }
];

const CONTRACT_ABI = [
  { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isAcceptedToken", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

const CONTRACT_ADDRESS = '0xc021324Ce6D9237c88e496a7bB5a6a6CDb2fd5cA';
const TEST_USDT_ADDRESS = '0xEae2DaD7A955840F3A70B90F118d2B8183b579DD';
const USER_ADDRESS = '0xE0DA5de14A81cb8B794c1BAA0DB9a8fde787cc1A'.toLowerCase();

async function check() {
  try {
    const admin = await client.readContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'admin' });
    console.log('Contract Admin:', admin);
    
    const isPaused = await client.readContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'paused' });
    console.log('Contract Paused:', isPaused);

    const isTokenAccepted = await client.readContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'isAcceptedToken', args: [TEST_USDT_ADDRESS] });
    console.log('Is Token Accepted:', isTokenAccepted);

    const balance = await client.readContract({
      address: TEST_USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [USER_ADDRESS]
    });
    console.log('User USDT Balance:', balance.toString(), `(${Number(balance)/1e6} USDT)`);

    const allowance = await client.readContract({
      address: TEST_USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [USER_ADDRESS, CONTRACT_ADDRESS]
    });
    console.log('User USDT Allowance to Contract:', allowance.toString(), `(${Number(allowance)/1e6} USDT)`);
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
