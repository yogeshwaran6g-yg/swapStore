import { queryRunner } from '../config/db.js';

async function main() {
  try {
    const res = await queryRunner(`UPDATE loans SET status = 'approved', disbursed_at = NOW() WHERE status = 'pending' LIMIT 1`);
    console.log('Fixed pending loan:', res);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
main();
