import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({
  chain: polygon,
  transport: http()
});

const txHash = '0xa71b4ec0025330173b2486315ece2da3ca32364962b5db555fa5f4cf5eded0e9';

async function check() {
  try {
    const tx = await client.getTransaction({ hash: txHash });
    console.log('Transaction:', tx.hash);
    console.log('To:', tx.to);
    console.log('From:', tx.from);
    console.log('Value:', tx.value.toString());
    console.log('Input Data:', tx.input);

    const receipt = await client.getTransactionReceipt({ hash: txHash });
    console.log('Status:', receipt.status);
    console.log('Logs count:', receipt.logs.length);
    
    for (const log of receipt.logs) {
      console.log('Log Address:', log.address);
      console.log('Log Topics:', log.topics);
      console.log('Log Data:', log.data);
    }
  } catch (e) {
    console.error('Error fetching transaction:', e);
  }
}

check();
