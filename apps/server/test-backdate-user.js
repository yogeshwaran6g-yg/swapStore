import dotenv from 'dotenv';
dotenv.config();
import { queryRunner } from './src/config/db.js';

/**
 * Test Helper: Backdate next_debit_date for a specific user's active loans
 * so the cron picks them up immediately — useful for testing interest collection.
 *
 * Usage:
 *   node test-backdate-user.js <walletAddress>           → Show active loans for that wallet
 *   node test-backdate-user.js <walletAddress> backdate  → Set next_debit_date to 1 hour ago (cron-ready)
 *   node test-backdate-user.js <walletAddress> reset     → Reset next_debit_date to 30 days from now
 */

const walletAddress = process.argv[2];
const action = process.argv[3]; // 'backdate' | 'reset' | undefined (just show)

if (!walletAddress) {
  console.log('\n❌ Please provide a wallet address.\n');
  console.log('Usage:');
  console.log('  node test-backdate-user.js <walletAddress>');
  console.log('  node test-backdate-user.js <walletAddress> backdate');
  console.log('  node test-backdate-user.js <walletAddress> reset\n');
  process.exit(1);
}

async function run() {
  try {
    // 1. Find all loans for this wallet
    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.loan_id) as loan_id,
              l.principal_amount, l.interest_rate, l.status,
              l.token_symbol, l.network,
              l.next_debit_date, l.maturity_date, l.created_at,
              u.email, u.wallet_address
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       WHERE LOWER(u.wallet_address) = LOWER(?)
       ORDER BY l.created_at DESC`,
      [walletAddress]
    );

    if (!loans || loans.length === 0) {
      console.log(`\n❌ No loans found for wallet: ${walletAddress}\n`);
      process.exit(0);
    }

    // 2. Display all loans
    console.log(`\n👤 Wallet: ${walletAddress}`);
    if (loans[0].email) console.log(`📧 Email : ${loans[0].email}`);
    console.log('\n📋 Loans:\n');
    console.log('─'.repeat(130));
    console.log(
      'UID'.padEnd(14),
      'Amount'.padEnd(10),
      'Token'.padEnd(8),
      'Network'.padEnd(10),
      'Rate'.padEnd(8),
      'Status'.padEnd(12),
      'Next Debit'.padEnd(28),
      'Maturity'.padEnd(28)
    );
    console.log('─'.repeat(130));

    const activeLoans = [];
    for (const loan of loans) {
      const nextDebit = loan.next_debit_date ? new Date(loan.next_debit_date).toLocaleString() : 'N/A';
      const maturity = loan.maturity_date ? new Date(loan.maturity_date).toLocaleString() : 'N/A';
      const isPastDue = loan.next_debit_date && new Date(loan.next_debit_date) <= new Date();
      const isActive = ['approved', 'active'].includes(loan.status);

      if (isActive) activeLoans.push(loan);

      console.log(
        (loan.uid?.slice(0, 12) + '..').padEnd(14),
        String(Number(loan.principal_amount).toFixed(2)).padEnd(10),
        (loan.token_symbol || '—').padEnd(8),
        (loan.network || '—').padEnd(10),
        (loan.interest_rate + '%').padEnd(8),
        (loan.status + (isPastDue && isActive ? ' ⚡' : '')).padEnd(12),
        nextDebit.padEnd(28),
        maturity.padEnd(28)
      );
    }
    console.log('─'.repeat(130));
    console.log(`\n⚡ = next_debit_date is in the past → cron WILL process this loan`);
    console.log(`📌 Active loans (approved/active): ${activeLoans.length} of ${loans.length} total\n`);

    if (activeLoans.length === 0) {
      console.log('⚠️  No active/approved loans to backdate. Cron only processes active loans.\n');
      process.exit(0);
    }

    // 3. Perform action on active loans only
    if (action === 'backdate') {
      const result = await queryRunner(
        `UPDATE loans l
         JOIN users u ON l.user_uid = u.uid
         SET l.next_debit_date = DATE_SUB(NOW(), INTERVAL 1 HOUR)
         WHERE LOWER(u.wallet_address) = LOWER(?)
           AND l.status IN ('approved', 'active')`,
        [walletAddress]
      );

      console.log(`✅ Backdated ${result.affectedRows} active loan(s) for this wallet.`);
      console.log(`   next_debit_date → set to 1 hour ago (cron will pick them up now)\n`);
      console.log(`👉 Now go to Admin Panel → Cron Jobs → "Run Interest Collection — All Users"\n`);

    } else if (action === 'reset') {
      const freqDays = 30;
      const result = await queryRunner(
        `UPDATE loans l
         JOIN users u ON l.user_uid = u.uid
         SET l.next_debit_date = DATE_ADD(NOW(), INTERVAL ${freqDays} DAY)
         WHERE LOWER(u.wallet_address) = LOWER(?)
           AND l.status IN ('approved', 'active')`,
        [walletAddress]
      );

      console.log(`✅ Reset ${result.affectedRows} active loan(s) — next_debit_date set to ${freqDays} days from now.\n`);

    } else {
      console.log('💡 Commands:');
      console.log(`   node test-backdate-user.js ${walletAddress} backdate  → Make active loans cron-ready`);
      console.log(`   node test-backdate-user.js ${walletAddress} reset     → Reset to 30 days from now\n`);
    }

    // 4. Show recent interest ledger for this wallet's loans
    const loanUids = loans.map(l => l.uid);
    if (loanUids.length > 0) {
      const placeholders = loanUids.map(() => 'UNHEX(?)').join(', ');
      const ledger = await queryRunner(
        `SELECT lil.id, HEX(lil.loan_uid) as loan_uid, lil.interest_amount,
                lil.collection_status, lil.period_start, lil.period_end,
                lil.collected_at, lil.failure_reason
         FROM loan_interest_ledger lil
         WHERE lil.loan_uid IN (${placeholders})
         ORDER BY lil.created_at DESC LIMIT 10`,
        loanUids
      );

      if (ledger && ledger.length > 0) {
        console.log('📒 Recent Interest Ledger (this wallet):\n');
        for (const entry of ledger) {
          const icon = entry.collection_status === 'collected' ? '✅' :
                       entry.collection_status === 'failed'    ? '❌' : '⏳';
          console.log(
            `  ${icon} Ledger #${entry.id} | Loan: ${entry.loan_uid?.slice(0, 8)}.. | ` +
            `Amount: $${Number(entry.interest_amount).toFixed(4)} | ` +
            `Status: ${entry.collection_status} | ` +
            `Collected: ${entry.collected_at ? new Date(entry.collected_at).toLocaleString() : '—'}`
          );
          if (entry.failure_reason) {
            console.log(`     ↳ Reason: ${entry.failure_reason.split('\n')[0]}`);
          }
        }
        console.log('');
      } else {
        console.log('📒 No interest ledger entries for this wallet yet.\n');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
