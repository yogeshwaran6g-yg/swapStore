import 'dotenv/config';
import { queryRunner } from '../src/config/db.js';

const wallet = '0x457DDBAa72ACa0DD4d8be98Fa3f4F3c3b98bbC11';

async function updateKyc() {
  try {
    const users = await queryRunner(`SELECT * FROM users WHERE LOWER(wallet_address) = LOWER(?)`, [wallet]);
    
    if (users.length === 0) {
      console.log(`User with wallet ${wallet} not found.`);
      process.exit(1);
    }
    
    const userUid = users[0].uid;
    console.log(`Found user with UID: ${userUid.toString('hex')}`);

    // Update the user's KYC status to 'approved'
    await queryRunner(`UPDATE users SET kyc_status = 'approved' WHERE uid = ?`, [userUid]);
    console.log(`Updated user table: kyc_status = 'approved'`);

    // Add a dummy KYC document to user_kyc_documents if none exists
    const docs = await queryRunner(`SELECT * FROM user_kyc_documents WHERE user_uid = ?`, [userUid]);
    if (docs.length === 0) {
      await queryRunner(
        `INSERT INTO user_kyc_documents (user_uid, document_type, document_url, status) VALUES (?, 'id_card', 'dummy_url.jpg', 'approved')`,
        [userUid]
      );
      console.log(`Inserted approved dummy KYC document.`);
    } else {
      await queryRunner(`UPDATE user_kyc_documents SET status = 'approved' WHERE user_uid = ?`, [userUid]);
      console.log(`Updated existing KYC document(s) to 'approved'.`);
    }

    console.log('✅ Successfully approved KYC for testing.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateKyc();
