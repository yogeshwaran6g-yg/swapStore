import 'dotenv/config';
import { queryRunner } from '../config/db.js';

const drop = async () => {
    try {
        console.log('Starting database drop...');

        // Disable foreign key checks to safely drop tables
        await queryRunner('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Dropping exchange_rates...');
        await queryRunner('DROP TABLE IF EXISTS exchange_rates');

        // Add other tables here if needed in the future
        await queryRunner('DROP TABLE IF EXISTS swap_orders');
        await queryRunner('DROP TABLE IF EXISTS user_bank_accounts');
        await queryRunner('DROP TABLE IF EXISTS user_kyc_documents');
        await queryRunner('DROP TABLE IF EXISTS loans');
        await queryRunner('DROP TABLE IF EXISTS system_settings');
        await queryRunner('DROP TABLE IF EXISTS admins');
        await queryRunner('DROP TABLE IF EXISTS users');

        // Re-enable foreign key checks
        await queryRunner('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Drop completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error dropping tables:', error);
        process.exit(1);
    }
};

drop();
