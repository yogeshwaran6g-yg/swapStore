import cron from 'node-cron';
import { queryRunner } from '../config/db.js';
import { getSystemSettings, collectInterestForLoan, markLoanOverdue, checkAndAutoCloseLoan } from './loanService.js';

/**
 * Run interest collection for all active/approved loans that are due.
 * Called by the scheduled cron or manually by an admin.
 * @param {'auto_scheduled'|'admin_all'|'admin_specific'} runType
 * @param {number|null} triggeredBy - admin id (null for auto)
 * @param {string|null} targetUserUid - hex uid for specific user (null for all)
 * @param {string|null} targetLoanUid - hex uid for specific loan (null for all)
 */
export const runInterestCollection = async (runType = 'auto_scheduled', triggeredBy = null, targetUserUid = null, targetLoanUid = null) => {
  // 1. Create a cron_run record
  const cronResult = await queryRunner(
    `INSERT INTO loan_cron_runs (run_type, triggered_by, target_user_uid, target_loan_uid, run_status)
     VALUES (?, ?, ${targetUserUid ? 'UNHEX(?)' : 'NULL'}, ${targetLoanUid ? 'UNHEX(?)' : 'NULL'}, 'running')`,
    [runType, triggeredBy, ...(targetUserUid ? [targetUserUid] : []), ...(targetLoanUid ? [targetLoanUid] : [])]
  );
  const cronRunId = cronResult.insertId;

  let totalProcessed = 0;
  let successCount = 0;
  let failCount = 0;
  let overdueCount = 0;
  let totalInterestCollected = 0;
  const errors = [];

  try {
    // 2. Query loans that need interest collection
    let query = `
      SELECT HEX(l.uid) as uid, HEX(l.user_uid) as user_uid, HEX(l.loan_id) as loan_id,
             l.principal_amount, l.outstanding_principal, l.interest_rate,
             l.token_symbol, l.token_address, l.network, l.maturity_date,
             u.wallet_address
      FROM loans l
      JOIN users u ON l.user_uid = u.uid
      WHERE l.status IN ('approved', 'active') AND l.next_debit_date <= NOW()
    `;
    const params = [];

    if (targetUserUid) {
      query += ` AND l.user_uid = UNHEX(?)`;
      params.push(targetUserUid);
    }
    if (targetLoanUid) {
      query += ` AND l.uid = UNHEX(?)`;
      params.push(targetLoanUid);
    }

    const loansToProcess = await queryRunner(query, params);

    if (!loansToProcess || loansToProcess.length === 0) {
      console.log('⏰ No loans require interest collection this run.');
      await queryRunner(
        `UPDATE loan_cron_runs SET run_status = 'completed', completed_at = NOW() WHERE id = ?`,
        [cronRunId]
      );
      return { cronRunId, totalProcessed: 0 };
    }

    // 3. Process each loan
    const gracePeriodDays = Number(await getSystemSettings('loan_grace_period_days')) || 3;

    for (const loan of loansToProcess) {
      totalProcessed++;

      // Check if loan should auto-close
      const closed = await checkAndAutoCloseLoan(loan);
      if (closed) {
        console.log(`⏰ Loan ${loan.loan_id} auto-closed at maturity.`);
        continue;
      }

      // Attempt interest collection
      const result = await collectInterestForLoan(loan, cronRunId);

      if (result.success) {
        successCount++;
        totalInterestCollected += result.interestAmount;
        console.log(`✅ Collected ${result.interestAmount} interest for loan ${loan.loan_id}`);
      } else {
        failCount++;
        errors.push(`Loan ${loan.loan_id}: ${result.failureReason}`);
        console.error(`❌ Failed to collect interest for loan ${loan.loan_id}: ${result.failureReason}`);

        // Check if past grace period → mark overdue
        const now = new Date();
        const nextDebit = new Date(loan.next_debit_date || now);
        const daysPastDue = (now - nextDebit) / (1000 * 60 * 60 * 24);
        if (daysPastDue > gracePeriodDays) {
          await markLoanOverdue(loan.uid);
          overdueCount++;
          console.log(`⚠️ Loan ${loan.loan_id} marked as overdue.`);
        }
      }
    }

    // 4. Update cron_run record
    const runStatus = failCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'failed');
    await queryRunner(
      `UPDATE loan_cron_runs 
       SET run_status = ?, total_loans_processed = ?, successful_collections = ?,
           failed_collections = ?, overdue_flagged = ?, total_interest_collected = ?,
           error_log = ?, completed_at = NOW()
       WHERE id = ?`,
      [runStatus, totalProcessed, successCount, failCount, overdueCount, totalInterestCollected,
       errors.length > 0 ? errors.join('\n') : null, cronRunId]
    );

    return { cronRunId, totalProcessed, successCount, failCount, overdueCount, totalInterestCollected };
  } catch (err) {
    console.error('❌ Critical error in interest collection cron:', err);
    await queryRunner(
      `UPDATE loan_cron_runs SET run_status = 'failed', error_log = ?, completed_at = NOW() WHERE id = ?`,
      [err.message, cronRunId]
    );
    throw err;
  }
};

export const startCronJobs = () => {
  console.log('⏰ Starting cron jobs...');

  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily loan interest collection cron...');
    try {
      const result = await runInterestCollection('auto_scheduled');
      console.log(`⏰ Cron completed: ${result.totalProcessed} loans processed, ${result.successCount} collected, ${result.failCount} failed, ${result.overdueCount} overdue.`);
    } catch (err) {
      console.error('❌ Error in daily loan cron job:', err);
    }
  });
};
