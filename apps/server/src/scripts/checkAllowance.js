import { createPublicClient, http, parseAbiItem } from 'viem';
import { bsc } from 'viem/chains';

async function main() {
  const transport = http('https://bsc-dataseed.binance.org/');
  const publicClient = createPublicClient({ chain: bsc, transport });
  
  const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
  const LOAN_CONTRACT = '0xfaa09C346475BaB145151d5DAF2c4f452Dc66a59';
  const LOAN_WALLET = '0x9F334423476237bAa258e234dd36eD0C175AfD66';

  try {
    const allowance = await publicClient.readContract({
      address: USDT_ADDRESS,
      abi: [parseAbiItem('function allowance(address owner, address spender) view returns (uint256)')],
      functionName: 'allowance',
      args: [LOAN_WALLET, LOAN_CONTRACT]
    });
    console.log('Current Allowance (WEI):', allowance.toString());
  } catch (e) {
    console.log('Error:', e.message);
  }
}
main();
