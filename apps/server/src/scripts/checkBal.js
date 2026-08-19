import { createPublicClient, http, parseAbiItem } from 'viem';
import { bsc } from 'viem/chains';

async function main() {
  const transport = http('https://bsc-dataseed.binance.org/');
  const publicClient = createPublicClient({ chain: bsc, transport });
  
  const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
  const LOAN_WALLET = '0x9F334423476237bAa258e234dd36eD0C175AfD66';

  try {
    const bal = await publicClient.readContract({
      address: USDT_ADDRESS,
      abi: [parseAbiItem('function balanceOf(address owner) view returns (uint256)')],
      functionName: 'balanceOf',
      args: [LOAN_WALLET]
    });
    console.log('Current Balance (WEI):', bal.toString());
  } catch (e) {
    console.log('Error:', e.message);
  }
}
main();
