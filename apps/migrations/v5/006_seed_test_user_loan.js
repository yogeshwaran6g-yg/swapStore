/**
 * Migration v5-006: Seed test loan for wallet 0x03c2AA4e1070C9AeaB19D3f6B1f12d4e01D243aa
 *
 * This script:
 *  1. Finds the user by wallet address
 *  2. Approves their KYC (inserts a bypass doc if none exists)
 *  3. Inserts an 'active' loan for 100 USDT on BSC
 *     with next_debit_date = NOW() so the very next cron run picks it up
 *
 * Run: node apps/migrations/v5/006_seed_test_user_loan.js
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import { queryRunner } from '../../server/src/config/db.js';

const TARGET_WALLET  = '0x03c2AA4e1070C9AeaB19D3f6B1f12d4e01D243aa';
const TOKEN_SYMBOL   = 'USDT';
const TOKEN_ADDRESS  = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC
const NETWORK        = 'bsc';
const PRINCIPAL      = 100;
const INTEREST_RATE  = 5; // 5%

const run = async () => {
  try {
    console.log(`\n🔍 Looking up user for wallet ${TARGET_WALLET}...`);

    // ── 1. Find user ────────────────────────────────────────────────────────
    const users = await queryRunner(
      `SELECT HEX(uid) as uid, email, kyc_status FROM users WHERE LOWER(wallet_address) = LOWER(?) LIMIT 1`,
      [TARGET_WALLET]
    );

    if (!users || users.length === 0) {
      console.error(`❌  No user found with wallet address ${TARGET_WALLET}`);
      console.error(`    Make sure the user has connected their wallet and logged in at least once.`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅  Found user: ${user.email} (uid: ${user.uid})`);
    console.log(`    Current KYC status: ${user.kyc_status}`);

    // ── 2. Approve KYC ──────────────────────────────────────────────────────
    const existingKyc = await queryRunner(
      `SELECT id, status FROM user_kyc_documents WHERE user_uid = UNHEX(?) LIMIT 1`,
      [user.uid]
    );

    if (!existingKyc || existingKyc.length === 0) {
      await queryRunner(
        `INSERT INTO user_kyc_documents (user_uid, document_type, document_url, status)
         VALUES (UNHEX(?), 'test_bypass', '/uploads/test_bypass_doc.jpg', 'approved')`,
        [user.uid]
      );
      console.log(`✅  KYC document created and approved (test bypass)`);
    } else {
      await queryRunner(
        `UPDATE user_kyc_documents SET status = 'approved', updated_at = NOW()
         WHERE user_uid = UNHEX(?)`,
        [user.uid]
      );
      console.log(`✅  Existing KYC document updated to approved`);
    }

    await queryRunner(
      `UPDATE users SET kyc_status = 'approved' WHERE uid = UNHEX(?)`,
      [user.uid]
    );
    console.log(`✅  User kyc_status set to 'approved'`);

    // ── 3. Seed active loan ─────────────────────────────────────────────────
    const now          = new Date();
    const maturityDate = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 25 days from now
    const nextDebit    = new Date(now); // RIGHT NOW — cron picks it up on the very next run

    const loanUid   = randomUUID().replace(/-/g, '');
    const hexLoanId = randomUUID().replace(/-/g, '');

    await queryRunner(
      `INSERT INTO loans
         (uid, user_uid, loan_id,
          principal_amount, outstanding_principal,
          interest_rate, token_symbol, token_address,
          network, loan_term_days, maturity_date,
          next_debit_date, status)
       VALUES
         (UNHEX(?), UNHEX(?), UNHEX(?),
          ?, ?,
          ?, ?, ?,
          ?, 30, ?,
          ?, 'active')`,
      [
        loanUid, user.uid, hexLoanId,
        PRINCIPAL, PRINCIPAL,
        INTEREST_RATE, TOKEN_SYMBOL, TOKEN_ADDRESS,
        NETWORK, maturityDate,
        nextDebit,
      ]
    );

    console.log(`\n✅  Test loan seeded successfully!`);
    console.log(`    loanUid:        ${loanUid}`);
    console.log(`    loanId:         ${hexLoanId}`);
    console.log(`    status:         active`);
    console.log(`    principal:      ${PRINCIPAL} ${TOKEN_SYMBOL}`);
    console.log(`    interestRate:   ${INTEREST_RATE}%`);
    console.log(`    network:        ${NETWORK}`);
    console.log(`    tokenAddress:   ${TOKEN_ADDRESS}`);
    console.log(`    nextDebitDate:  ${nextDebit.toISOString()}  ← cron will pick this up immediately`);
    console.log(`    maturityDate:   ${maturityDate.toISOString()}`);
    console.log(`\n🚀  Ready! Run the cron now from the admin panel.`);
    console.log(`    Expected cron behaviour:`);
    console.log(`      → collectPayment called on-chain`);
    console.log(`      → if USDT balance low: ledger entry = failed`);
    console.log(`      → daysPastDue = 0 < gracePeriod(3) → NOT overdue yet`);
    console.log(`      → run again tomorrow (or re-seed with pastGracePeriod) to test overdue\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌  Seed script failed:', err);
    process.exit(1);
  }
};

run();
