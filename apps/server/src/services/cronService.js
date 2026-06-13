import cron from 'node-cron';
import { queryRunner } from '../config/db.js';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc, polygon } from 'viem/chains';
import { getSystemSettings } from './loanService.js';

// We need a wallet client to send transactions on behalf of the admin/loan contract manager
const account = process.env.ADMIN_PRIVATE_KEY ? privateKeyToAccount(`0x${process.env.ADMIN_PRIVATE_KEY}`) : null;

// The ABI for CryptoLoanSettlement
const LOAN_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "loanId", "type": "bytes32" },
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "collectPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const startCronJobs = () => {
  console.log('⏰ Starting cron jobs...');

  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily loan interest deduction check...');
    try {
      // Find loans where next_debit_date is past or today
      const loansToDebit = await queryRunner(
        `SELECT HEX(l.uid) as uid, HEX(l.user_uid) as user_uid, HEX(l.loan_id) as loan_id, l.principal_amount, l.interest_rate, u.wallet_address 
         FROM loans l
         JOIN users u ON l.user_uid = u.uid
         WHERE l.status = 'approved' AND l.next_debit_date <= NOW()`
      );

      if (!loansToDebit || loansToDebit.length === 0) {
        console.log('⏰ No loans require interest deduction today.');
        return;
      }

      for (const loan of loansToDebit) {
        const interestAmount = (Number(loan.principal_amount) * Number(loan.interest_rate)) / 100;
        
        console.log(`⏰ Attempting to deduct ${interestAmount} from user ${loan.wallet_address} for loan ${loan.loan_id}`);

        if (account && process.env.BSC_CONTRACT_ADDRESS) {
          const walletClient = createWalletClient({
            account,
            chain: bsc, // assuming BSC for now, this could be dynamic based on user preference
            transport: http(process.env.BSC_RPC_URL)
          });

          // In production, you would handle this more robustly and handle decimals correctly.
          // For now, this is a placeholder demonstrating the viem contract interaction.
          try {
             // We convert the interest amount assuming the token has 18 decimals. 
             // In a robust implementation, you should dynamically fetch the token's decimals.
             const amountInWei = BigInt(Math.floor(interestAmount * 1e18));
             
             // Uncommented the real transaction call to collectPayment
             const txHash = await walletClient.writeContract({
               address: process.env.BSC_CONTRACT_ADDRESS,
               abi: LOAN_ABI,
               functionName: 'collectPayment',
               args: [`0x${loan.loan_id}`, loan.wallet_address, amountInWei]
             });
             
             console.log(`✅ Successfully called collectPayment on smart contract! TxHash: ${txHash}`);

             // Update next debit date to next month (30 days)
             await queryRunner(
               `UPDATE loans SET next_debit_date = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE uid = UNHEX(?)`,
               [loan.uid]
             );
          } catch(err) {
            console.error(`❌ Failed to deduct interest for loan ${loan.loan_id}:`, err);
          }
        } else {
          console.log(`⚠️ Skipping blockchain transaction: ADMIN_PRIVATE_KEY not set`);
          // Mark as processed anyway for testing
          await queryRunner(
            `UPDATE loans SET next_debit_date = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE uid = UNHEX(?)`,
            [loan.uid]
          );
        }
      }
    } catch (err) {
      console.error('❌ Error in daily loan cron job:', err);
    }
  });
};
