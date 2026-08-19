import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Migration v5-005: Seeding loan system_settings...");

        const settings = [
            ['loan_eligibility_tiers', '[{"token":"USDT","network":"bsc","min_balance":10,"max_loan":50},{"token":"USDT","network":"bsc","min_balance":50,"max_loan":300}]'],
            ['loan_interest_calc_basis', 'principal'],
            ['loan_interest_frequency_days', '30'],
            ['loan_default_term_days', '30'],
            ['loan_default_threshold_days', '90'],
            ['loan_grace_period_days', '3'],
            ['loan_auto_close_on_maturity', '1'],
        ];

        for (const [key, value] of settings) {
            await queryRunner(
                `INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)`,
                [key, value]
            );
            console.log(`  ✅ ${key} = ${value}`);
        }

        // Verify all loan settings
        const allSettings = await queryRunner(
            `SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'loan_%' ORDER BY setting_key`
        );
        console.log("\n📋 All loan settings:");
        for (const row of allSettings) {
            console.log(`   ${row.setting_key} = ${row.setting_value}`);
        }

        console.log("\nMigration v5-005 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration v5-005 failed:", err);
        process.exit(1);
    }
};

migrate();
