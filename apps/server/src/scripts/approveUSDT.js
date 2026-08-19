import { createWalletClient, http, parseAbiItem, maxUint256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';

async function main() {
  const pk = '0x1c0c63a565d12cd015e8f18013b3bf8c829630fa0391341906361998bb565ea3';
  const account = privateKeyToAccount(pk);
  console.log('Wallet address:', account.address);
  
  const transport = http('https://bsc-dataseed.binance.org/');
  const walletClient = createWalletClient({
    account,
    chain: bsc,
    transport
  });

  const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
  const LOAN_CONTRACT = '0xfaa09C346475BaB145151d5DAF2c4f452Dc66a59';

  console.log('Approving USDT for Loan Contract...');
  try {
    const tx = await walletClient.writeContract({
      address: USDT_ADDRESS,
      abi: [parseAbiItem('function approve(address spender, uint256 amount) external returns (bool)')],
      functionName: 'approve',
      args: [LOAN_CONTRACT, maxUint256],
    });
    console.log('Approve TX Hash:', tx);
    console.log('Wait for the transaction to confirm on BscScan.');
  } catch (error) {
    console.error('Error approving:', error);
  }
  process.exit(0);
}
main();
