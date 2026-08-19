import 'dotenv/config';
import { queryRunner } from '../config/db.js';

const newTiers = [
  {"token":"USDT","network":"bsc","min_balance":50,"max_loan":100},
  {"token":"USDT","network":"polygon","min_balance":50,"max_loan":100},
  {"token":"USDC","network":"bsc","min_balance":50,"max_loan":100},
  {"token":"USDC","network":"polygon","min_balance":50,"max_loan":100},
  {"token":"DAI","network":"bsc","min_balance":50,"max_loan":100},
  {"token":"DAI","network":"polygon","min_balance":50,"max_loan":100}
];

const update = async () => {
  try {
    await queryRunner(
      `UPDATE system_settings SET setting_value = ? WHERE setting_key = 'loan_eligibility_tiers'`,
      [JSON.stringify(newTiers)]
    );
    console.log("Updated loan_eligibility_tiers successfully");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

update();
