import dotenv from 'dotenv';
dotenv.config();
import { queryRunner } from './src/config/db.js';

async function run() {
  const uid = 'B25B05D95F054966B3863C1B591C7FB8';
  try {
    const result = await queryRunner(
      `UPDATE loans SET next_debit_date = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE user_uid = UNHEX(?) AND status IN ('approved', 'active')`,
      [uid]
    );
    console.log(`Updated ${result.affectedRows} loans for user ${uid}`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
