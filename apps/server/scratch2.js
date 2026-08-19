import { queryRunner } from './src/config/db.js';

async function test() {
  const result1 = await queryRunner("UPDATE swap_orders SET user_crypto_payment_status = 'failed' WHERE user_crypto_payment_status = 'initiated'");
  console.log(result1);
}
test().finally(() => process.exit());
