import dotenv from 'dotenv';
dotenv.config();
import { queryRunner } from './src/config/db.js';

async function seed() {
  try {
    await queryRunner(
      `INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES 
       ('loan_interest_calc_basis', 'original'),
       ('loan_interest_frequency_days', '30'),
       ('loan_auto_close_on_maturity', '1')`
    );
    
    const rows = await queryRunner('SELECT * FROM system_settings');
    console.log('✅ System settings:');
    rows.forEach(r => console.log(`  ${r.setting_key} = ${r.setting_value}`));
    
    console.log('\n✅ Done! Settings seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
