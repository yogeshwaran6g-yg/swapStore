import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';

async function main() {
  const transport = http('https://bsc-dataseed.binance.org/');
  const publicClient = createPublicClient({ chain: bsc, transport });
  
  try {
    const receipt = await publicClient.getTransactionReceipt({ 
      hash: '0xe897605724929a913079f7fc2d4843ae70a05723b2261d6368c33e90f7c9e9aa' 
    });
    console.log('Status:', receipt.status);
    console.log('Gas Used:', receipt.gasUsed.toString());
  } catch (e) {
    console.log('Error fetching receipt, maybe still pending or failed completely:', e.message);
  }
}
main();
