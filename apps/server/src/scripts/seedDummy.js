/**
 * Dummy data seeder for pagination testing.
 * Creates 50 test users + swap orders + loans
 * Run with: node --env-file=.env src/scripts/seedDummy.js
 */

import 'dotenv/config';
import { queryRunner } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const DUMMY_COUNT = 50;

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomAmount = () => (randomNum(10, 10000) + Math.random()).toFixed(2);

const NETWORKS = ['bnb', 'polygon'];
const TOKENS = ['USDT', 'USDC', 'DAI'];
const KYC_STATUSES = ['pending', 'approved', 'rejected'];
const SWAP_STATUSES = ['pending', 'processing', 'completed', 'failed'];
const LOAN_STATUSES = ['pending', 'approved', 'rejected', 'active'];

const TOKEN_ADDRESSES = {
  bnb: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    DAI:  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    DAI:  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  }
};

const seedDummy = async () => {
  try {
    console.log(`\n🌱 Seeding ${DUMMY_COUNT} dummy records for pagination testing...\n`);

    const userUids = [];

    // ── 1. Users ──────────────────────────────────────────────────────────────
    console.log('📦 Inserting dummy users...');
    for (let i = 1; i <= DUMMY_COUNT; i++) {
      const uid = uuidv4().replace(/-/g, '');
      userUids.push(uid);
      const wallet = `0x${uid.slice(0, 40)}`;
      const kycStatus = randomItem(KYC_STATUSES);
      const daysAgo = randomNum(1, 180);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      await queryRunner(
        `INSERT IGNORE INTO users
           (uid, email, phone, username, wallet_address, kyc_status, is_blocked, created_at)
         VALUES (UNHEX(?), ?, ?, ?, ?, ?, ?, ?)`,
        [
          uid,
          `dummy${i}@swapstore.test`,
          `+91900000${String(i).padStart(4, '0')}`,
          `user_dummy_${i}`,
          wallet,
          kycStatus,
          randomNum(0, 5) === 0 ? 1 : 0,
          createdAt,
        ]
      );
    }
    console.log(`  ✅ ${DUMMY_COUNT} users inserted.`);

    // ── 2. KYC Documents ──────────────────────────────────────────────────────
    console.log('📦 Inserting dummy KYC documents...');
    for (const uid of userUids) {
      const docStatus = randomItem(KYC_STATUSES);
      await queryRunner(
        `INSERT IGNORE INTO user_kyc_documents (user_uid, document_type, document_url, status)
         VALUES (UNHEX(?), ?, ?, ?)`,
        [uid, randomItem(['aadhaar', 'pan', 'passport']), '/uploads/dummy_doc.jpg', docStatus]
      );
    }
    console.log(`  ✅ ${DUMMY_COUNT} KYC documents inserted.`);

    // ── 3. Swap Orders ────────────────────────────────────────────────────────
    console.log('📦 Inserting dummy swap orders...');
    for (const uid of userUids) {
      const orderId = uuidv4().replace(/-/g, '');
      const network = randomItem(NETWORKS);
      const tokenSymbol = randomItem(TOKENS);
      const daysAgo = randomNum(0, 120);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      await queryRunner(
        `INSERT IGNORE INTO swap_orders
           (order_id, user_uid, token_symbol, token_address, amount, network,
            user_crypto_payment_status, admin_inr_payment_status, created_at)
         VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          uid,
          tokenSymbol,
          TOKEN_ADDRESSES[network][tokenSymbol],
          randomAmount(),
          network,
          randomItem(['pending', 'confirmed']),
          randomItem(SWAP_STATUSES),
          createdAt,
        ]
      );
    }
    console.log(`  ✅ ${DUMMY_COUNT} swap orders inserted.`);

    // ── 4. Loans ──────────────────────────────────────────────────────────────
    console.log('📦 Inserting dummy loans...');
    for (const uid of userUids) {
      const loanUid  = uuidv4().replace(/-/g, '');
      const loanId   = uuidv4().replace(/-/g, '');
      const network  = randomItem(NETWORKS);
      const token    = randomItem(TOKENS);
      const principal = randomAmount();
      const daysAgo  = randomNum(0, 90);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);
      const maturity  = new Date(createdAt.getTime() + 30 * 86400000);
      const nextDebit = new Date(createdAt.getTime() + randomNum(1, 30) * 86400000);

      await queryRunner(
        `INSERT IGNORE INTO loans
           (uid, user_uid, loan_id, principal_amount, outstanding_principal,
            interest_rate, token_symbol, token_address, network,
            loan_term_days, maturity_date, next_debit_date, status, created_at)
         VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, ?, 30, ?, ?, ?, ?)`,
        [
          loanUid, uid, loanId,
          principal, principal,
          randomNum(3, 10),
          token,
          TOKEN_ADDRESSES[network][token],
          network,
          maturity,
          nextDebit,
          randomItem(LOAN_STATUSES),
          createdAt,
        ]
      );
    }
    console.log(`  ✅ ${DUMMY_COUNT} loans inserted.`);

    console.log('\n🎉 Dummy seeding complete! You can now test pagination across all modules.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Dummy seeding failed:', err.message);
    process.exit(1);
  }
};

seedDummy();
