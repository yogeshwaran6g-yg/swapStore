import 'dotenv/config';
import { queryRunner } from '../config/db.js';

const truncate = async () => {
    try {
        console.log('Starting database truncation...');
        
        // Truncate tables
        console.log('Truncating exchange_rates...');
        await queryRunner('TRUNCATE TABLE exchange_rates');
        
        console.log('Truncation completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error truncating database:', error);
        process.exit(1);
    }
};

truncate();
