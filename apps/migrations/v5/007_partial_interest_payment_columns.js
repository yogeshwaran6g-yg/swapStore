import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

/**
 * Migration v5-007: Partial Interest Payment Support
 *
 * Changes:
 *  1. loans             → ADD COLUMN pending_interest_due
 *  2. loan_interest_ledger → ADD COLUMN collected_amount
 *  3. loan_interest_ledger → MODIFY collection_status ENUM to include 'partial'
 */
const migrate = async () => {
    try {
        console.log('Migration v5-007: Adding partial interest payment support...');

        // 1. Add pending_interest_due to loans
        try {
            await queryRunner(`
                ALTER TABLE loans
                ADD COLUMN pending_interest_due DECIMAL(36,18) NOT NULL DEFAULT 0
                AFTER total_interest_paid
            `);
            console.log('✅ Added pending_interest_due to loans');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⏭️  pending_interest_due already exists on loans, skipping.');
            } else {
                throw err;
            }
        }

        // 2. Add collected_amount to loan_interest_ledger
        try {
            await queryRunner(`
                ALTER TABLE loan_interest_ledger
                ADD COLUMN collected_amount DECIMAL(36,18) DEFAULT 0
                AFTER interest_amount
            `);
            console.log('✅ Added collected_amount to loan_interest_ledger');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⏭️  collected_amount already exists on loan_interest_ledger, skipping.');
            } else {
                throw err;
            }
        }

        // 3. Update collection_status ENUM to include 'partial'
        await queryRunner(`
            ALTER TABLE loan_interest_ledger
            MODIFY COLUMN collection_status ENUM(
                'pending', 'collecting', 'collected', 'partial',
                'failed', 'skipped', 'overdue'
            ) DEFAULT 'pending'
        `);
        console.log("✅ Updated collection_status ENUM to include 'partial'");

        console.log('Migration v5-007 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration v5-007 failed:', err);
        process.exit(1);
    }
};

migrate();
