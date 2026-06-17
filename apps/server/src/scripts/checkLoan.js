import { queryRunner } from '../config/db.js';

async function main() {
  try {
    const loans = await queryRunner(`SELECT HEX(uid) as uid, HEX(loan_id) as loan_id, principal_amount, token_symbol, token_address, network FROM loans ORDER BY created_at DESC LIMIT 5`);
    console.log(loans);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
main();
