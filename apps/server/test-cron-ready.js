import dotenv from 'dotenv';
dotenv.config();
import { queryRunner } from './src/config/db.js';

/**
 * Test Helper: Backdate loan next_debit_date so the cron picks them up.
 * 
 * Usage:
 *   node test-cron-ready.js              → Show all loans and their next_debit_date
 *   node test-cron-ready.js backdate     → Set ALL active loans' next_debit_date to NOW (makes cron process them)
 *   node test-cron-ready.js backdate <loanUid>  → Set a specific loan's next_debit_date to NOW
 *   node test-cron-ready.js reset        → Reset next_debit_date back to 30 days from now
 */

const action = process.argv[2]; // 'backdate' or 'reset' or undefined (just show)
const targetLoanUid = process.argv[3]; // optional specific loan uid

async function run() {
  try {
    // 1. Show all loans
    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.loan_id) as loan_id, 
              l.principal_amount, l.interest_rate, l.status, 
              l.next_debit_date, l.maturity_date, l.created_at,
              u.email, u.wallet_address
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       ORDER BY l.created_at DESC`
    );

    if (!loans || loans.length === 0) {
      console.log('❌ No loans found in the database. Create a loan first via the client app.');
      process.exit(0);
    }

    console.log('\n📋 All Loans:\n');
    console.log('─'.repeat(120));
    console.log(
      'UID'.padEnd(12),
      'Email'.padEnd(25),
      'Amount'.padEnd(12),
      'Rate'.padEnd(8),
      'Status'.padEnd(12),
      'Next Debit'.padEnd(25),
      'Maturity'.padEnd(25)
    );
    console.log('─'.repeat(120));

    for (const loan of loans) {
      const nextDebit = loan.next_debit_date ? new Date(loan.next_debit_date).toLocaleString() : 'N/A';
      const maturity = loan.maturity_date ? new Date(loan.maturity_date).toLocaleString() : 'N/A';
      const isPastDue = loan.next_debit_date && new Date(loan.next_debit_date) <= new Date();

      console.log(
        (loan.uid?.slice(0, 10) + '..').padEnd(12),
        (loan.email || '—').padEnd(25),
        String(Number(loan.principal_amount).toFixed(2)).padEnd(12),
        (loan.interest_rate + '%').padEnd(8),
        (loan.status + (isPastDue ? ' ⚡' : '')).padEnd(12),
        nextDebit.padEnd(25),
        maturity.padEnd(25)
      );
    }
    console.log('─'.repeat(120));
    console.log(`\n⚡ = next_debit_date is in the past (cron WILL process this loan)\n`);

    // 2. Backdate or reset
    if (action === 'backdate') {
      const where = targetLoanUid 
        ? `WHERE uid = UNHEX('${targetLoanUid}')` 
        : `WHERE status IN ('approved', 'active')`;
      
      const result = await queryRunner(
        `UPDATE loans SET next_debit_date = DATE_SUB(NOW(), INTERVAL 1 HOUR) ${where}`
      );
      
      console.log(`✅ Backdated ${result.affectedRows} loan(s) — next_debit_date set to 1 hour ago.`);
      console.log(`\n👉 Now go to Admin Panel → Cron Jobs → Click "Run Interest Collection — All Users"\n`);
      
    } else if (action === 'reset') {
      const freqDays = 30;
      const where = targetLoanUid 
        ? `WHERE uid = UNHEX('${targetLoanUid}')` 
        : `WHERE status IN ('approved', 'active')`;
      
      const result = await queryRunner(
        `UPDATE loans SET next_debit_date = DATE_ADD(NOW(), INTERVAL ${freqDays} DAY) ${where}`
      );
      
      console.log(`✅ Reset ${result.affectedRows} loan(s) — next_debit_date set to ${freqDays} days from now.`);
      
    } else {
      console.log('💡 Commands:');
      console.log('   node test-cron-ready.js backdate          → Make all active loans ready for cron');
      console.log('   node test-cron-ready.js backdate <uid>    → Make a specific loan ready');
      console.log('   node test-cron-ready.js reset             → Reset next_debit_date to 30 days out');
    }

    // 3. Show interest ledger
    const ledger = await queryRunner(
      `SELECT id, HEX(loan_uid) as loan_uid, interest_amount, collection_status, 
              period_start, period_end, collected_at, failure_reason
       FROM loan_interest_ledger ORDER BY created_at DESC LIMIT 10`
    );

    if (ledger && ledger.length > 0) {
      console.log('\n📒 Recent Interest Ledger Entries:\n');
      for (const entry of ledger) {
        const status = entry.collection_status === 'collected' ? '✅' : 
                       entry.collection_status === 'failed' ? '❌' : '⏳';
        console.log(
          `  ${status} Ledger #${entry.id} | Loan: ${entry.loan_uid?.slice(0, 8)}.. | ` +
          `Amount: $${Number(entry.interest_amount).toFixed(4)} | ` +
          `Status: ${entry.collection_status} | ` +
          `Collected: ${entry.collected_at ? new Date(entry.collected_at).toLocaleString() : '—'}`
        );
        if (entry.failure_reason) {
          console.log(`     ↳ Reason: ${entry.failure_reason}`);
        }
      }
    } else {
      console.log('\n📒 No interest ledger entries yet.');
    }

    // 4. Show cron runs
    const cronRuns = await queryRunner(
      `SELECT id, run_type, run_status, total_loans_processed, successful_collections,
              failed_collections, total_interest_collected, started_at
       FROM loan_cron_runs ORDER BY started_at DESC LIMIT 5`
    );

    if (cronRuns && cronRuns.length > 0) {
      console.log('\n🕐 Recent Cron Runs:\n');
      for (const run of cronRuns) {
        const status = run.run_status === 'completed' ? '✅' : 
                       run.run_status === 'failed' ? '❌' : '⏳';
        console.log(
          `  ${status} Run #${run.id} | Type: ${run.run_type} | ` +
          `Processed: ${run.total_loans_processed} | Success: ${run.successful_collections} | ` +
          `Failed: ${run.failed_collections} | Interest: $${Number(run.total_interest_collected).toFixed(4)} | ` +
          `At: ${new Date(run.started_at).toLocaleString()}`
        );
      }
    }

    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
