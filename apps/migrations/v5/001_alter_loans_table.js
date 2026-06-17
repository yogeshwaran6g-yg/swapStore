import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Migration v5-002: Altering loans table...");

        // Add token context columns
        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN token_symbol VARCHAR(10) DEFAULT NULL AFTER interest_rate`);
            console.log("  ✅ Added token_symbol");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  token_symbol already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN token_address VARCHAR(100) DEFAULT NULL AFTER token_symbol`);
            console.log("  ✅ Added token_address");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  token_address already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN network VARCHAR(50) DEFAULT NULL AFTER token_address`);
            console.log("  ✅ Added network");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  network already exists");
            else throw e;
        }

        // Disbursement tracking columns
        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN disbursed_amount DECIMAL(36,18) DEFAULT NULL AFTER network`);
            console.log("  ✅ Added disbursed_amount");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  disbursed_amount already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN disbursement_fee DECIMAL(36,18) DEFAULT NULL AFTER disbursed_amount`);
            console.log("  ✅ Added disbursement_fee");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  disbursement_fee already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN disbursement_tx_hash VARCHAR(100) DEFAULT NULL AFTER disbursement_fee`);
            console.log("  ✅ Added disbursement_tx_hash");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  disbursement_tx_hash already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN disbursed_at TIMESTAMP NULL AFTER disbursement_tx_hash`);
            console.log("  ✅ Added disbursed_at");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  disbursed_at already exists");
            else throw e;
        }

        // Running totals
        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN total_interest_paid DECIMAL(36,18) NOT NULL DEFAULT 0 AFTER disbursed_at`);
            console.log("  ✅ Added total_interest_paid");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  total_interest_paid already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN total_principal_paid DECIMAL(36,18) NOT NULL DEFAULT 0 AFTER total_interest_paid`);
            console.log("  ✅ Added total_principal_paid");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  total_principal_paid already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN outstanding_principal DECIMAL(36,18) DEFAULT NULL AFTER total_principal_paid`);
            console.log("  ✅ Added outstanding_principal");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  outstanding_principal already exists");
            else throw e;
        }

        // Overdue tracking
        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN is_overdue TINYINT(1) NOT NULL DEFAULT 0 AFTER outstanding_principal`);
            console.log("  ✅ Added is_overdue");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  is_overdue already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN overdue_since TIMESTAMP NULL AFTER is_overdue`);
            console.log("  ✅ Added overdue_since");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  overdue_since already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN overdue_count INT NOT NULL DEFAULT 0 AFTER overdue_since`);
            console.log("  ✅ Added overdue_count");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  overdue_count already exists");
            else throw e;
        }

        // Term & maturity
        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN loan_term_days INT DEFAULT 30 AFTER overdue_count`);
            console.log("  ✅ Added loan_term_days");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  loan_term_days already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN maturity_date TIMESTAMP NULL AFTER loan_term_days`);
            console.log("  ✅ Added maturity_date");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  maturity_date already exists");
            else throw e;
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN closed_at TIMESTAMP NULL AFTER maturity_date`);
            console.log("  ✅ Added closed_at");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  closed_at already exists");
            else throw e;
        }

        // Eligible token reference
        try {
            await queryRunner(`ALTER TABLE loans ADD COLUMN eligible_token_id INT DEFAULT NULL AFTER closed_at`);
            console.log("  ✅ Added eligible_token_id");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("  ⏭️  eligible_token_id already exists");
            else throw e;
        }

        // Expand status enum
        try {
            await queryRunner(`
                ALTER TABLE loans MODIFY COLUMN status ENUM(
                    'pending',
                    'approved',
                    'active',
                    'overdue',
                    'defaulted',
                    'repaid',
                    'rejected',
                    'closed'
                ) DEFAULT 'pending'
            `);
            console.log("  ✅ Expanded status enum");
        } catch (e) {
            console.error("  ❌ Failed to expand status enum:", e.message);
        }

        // Add indexes (ignore if already exist)
        try {
            await queryRunner(`ALTER TABLE loans ADD KEY idx_loan_overdue (is_overdue)`);
            console.log("  ✅ Added idx_loan_overdue");
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') console.log("  ⏭️  idx_loan_overdue already exists");
            else console.error("  ⚠️  Index error:", e.message);
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD KEY idx_loan_maturity (maturity_date)`);
            console.log("  ✅ Added idx_loan_maturity");
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') console.log("  ⏭️  idx_loan_maturity already exists");
            else console.error("  ⚠️  Index error:", e.message);
        }

        try {
            await queryRunner(`ALTER TABLE loans ADD KEY idx_loan_network (network)`);
            console.log("  ✅ Added idx_loan_network");
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') console.log("  ⏭️  idx_loan_network already exists");
            else console.error("  ⚠️  Index error:", e.message);
        }

        console.log("Migration v5-002 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration v5-002 failed:", err);
        process.exit(1);
    }
};

migrate();
