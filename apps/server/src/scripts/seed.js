import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { queryRunner } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
    try {
        console.log('Starting database seed...');
        
        // 1. Read db.sql
        const sqlFilePath = path.join(__dirname, '../../db.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Split by semicolon, filter out empty queries
        const queries = sqlContent
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        // 2. Execute db.sql for schema
        console.log('Executing schema queries from db.sql...');
        for (const query of queries) {
            await queryRunner(query);
        }
        console.log('Schema created successfully.');

        // 3. Execute insert values
        console.log('Inserting default exchange rates...');
        await queryRunner(`
            INSERT IGNORE INTO exchange_rates (token_symbol, network, inr_rate, is_active) VALUES
            ('USDT', 'bnb', 85.50, 1),
            ('USDC', 'bnb', 85.50, 1),
            ('DAI', 'bnb', 85.50, 1),
            ('USDT', 'polygon', 86.00, 1),
            ('USDC', 'polygon', 86.00, 1),
            ('DAI', 'polygon', 86.00, 1)
            ON DUPLICATE KEY UPDATE inr_rate = VALUES(inr_rate), is_active = VALUES(is_active);
        `);
        console.log('Seed data inserted successfully.');

        console.log('Database seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
