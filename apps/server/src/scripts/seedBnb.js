import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedBnb = async () => {
    try {
        console.log('Starting BNB database seed...');

        // 1. Connect without DB name to create it if it doesn't exist
        let connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        await connection.query('CREATE DATABASE IF NOT EXISTS \`swapstore-bnb\`');
        await connection.end();

        // Connect specifically to swapstore-bnb
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: 'swapstore-bnb',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        // 2. Read db.sql
        const sqlFilePath = path.join(__dirname, '../../db.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Split by semicolon, filter out empty queries
        const queries = sqlContent
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        // 3. Execute schema queries from db.sql
        console.log('Executing schema queries from db.sql...');
        for (const query of queries) {
            await connection.query(query);
        }
        console.log('Schema created successfully.');

        // 4. Cleanup any non-bnb specific data that might have been inserted by db.sql
        console.log('Cleaning up non-bnb data...');
        await connection.query("DELETE FROM exchange_rates WHERE network != 'bnb'");
        
        // 5. Update loan_eligibility_tiers to be bnb only
        const bnbTiers = JSON.stringify([
            { token: 'USDT', network: 'bnb', min_balance: 50, max_loan: 100 },
            { token: 'USDC', network: 'bnb', min_balance: 50, max_loan: 100 },
            { token: 'DAI', network: 'bnb', min_balance: 50, max_loan: 100 }
        ]);
        await connection.query("INSERT INTO system_settings (setting_key, setting_value) VALUES ('loan_eligibility_tiers', ?) ON DUPLICATE KEY UPDATE setting_value = ?", [bnbTiers, bnbTiers]);

        // 6. Insert bnb exchange rates
        console.log('Inserting BNB exchange rates...');
        await connection.query(`
            INSERT INTO exchange_rates (token_symbol, network, inr_rate, is_active) VALUES
            ('USDT', 'bnb', 85.50, 1),
            ('USDC', 'bnb', 85.50, 1),
            ('DAI', 'bnb', 85.50, 1)
            ON DUPLICATE KEY UPDATE inr_rate = VALUES(inr_rate), is_active = VALUES(is_active);
        `);
        
        // 7. Insert admin user
        console.log('Inserting admin user...');
        const username = 'admin';
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        const [rows] = await connection.query('SELECT id FROM admins WHERE username = ?', [username]);
        if (rows.length > 0) {
            await connection.query('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, username]);
            console.log('Admin user updated successfully! Username: admin, Password: admin123');
        } else {
            await connection.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
            console.log('Admin user created successfully! Username: admin, Password: admin123');
        }

        console.log('Database seeding for BNB completed successfully!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedBnb();
