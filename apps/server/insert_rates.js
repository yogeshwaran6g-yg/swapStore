import 'dotenv/config';
import { queryRunner } from './src/config/db.js';

const insertRates = async () => {
    try {
        console.log('Inserting test exchange rates...');
        await queryRunner(`
            INSERT IGNORE INTO exchange_rates (token_symbol, network, inr_rate, is_active) VALUES
            ('USDT', 'bnb', 88.50, 1),
            ('USDC', 'bnb', 88.40, 1),
            ('DAI', 'bnb', 88.30, 1)
            ON DUPLICATE KEY UPDATE inr_rate = VALUES(inr_rate), is_active = VALUES(is_active);
        `);
        console.log('Test exchange rates inserted successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to insert rates:', err);
        process.exit(1);
    }
};

insertRates();
