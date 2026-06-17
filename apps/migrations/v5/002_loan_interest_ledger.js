import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Migration v5-003: Creating loan_interest_ledger table...");

        await queryRunner(`
            CREATE TABLE IF NOT EXISTS loan_interest_ledger (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                loan_uid          BINARY(16)     NOT NULL,
                user_uid          BINARY(16)     NOT NULL,

                interest_amount   DECIMAL(36,18) NOT NULL,
                interest_rate     DECIMAL(5,2)   NOT NULL,
                principal_at_time DECIMAL(36,18) NOT NULL,

                period_start      TIMESTAMP      NOT NULL,
                period_end        TIMESTAMP      NOT NULL,

                collection_status ENUM(
                    'pending', 'collecting', 'collected',
                    'failed', 'skipped', 'overdue'
                ) DEFAULT 'pending',

                tx_hash           VARCHAR(100)   DEFAULT NULL,
                wallet_address    VARCHAR(100)   DEFAULT NULL,
                token_symbol      VARCHAR(10)    DEFAULT NULL,
                network           VARCHAR(50)    DEFAULT NULL,

                cron_run_id       BIGINT         DEFAULT NULL,
                failure_reason    TEXT           DEFAULT NULL,

                collected_at      TIMESTAMP      NULL,
                created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
                updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                CONSTRAINT fk_interest_loan FOREIGN KEY (loan_uid) REFERENCES loans(uid) ON DELETE CASCADE,
                CONSTRAINT fk_interest_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,

                KEY idx_interest_loan (loan_uid),
                KEY idx_interest_user (user_uid),
                KEY idx_interest_status (collection_status),
                KEY idx_interest_period (period_start, period_end),
                KEY idx_interest_cron_run (cron_run_id)
            ) ENGINE=InnoDB;
        `);

        console.log("✅ Created loan_interest_ledger table");
        console.log("Migration v5-003 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration v5-003 failed:", err);
        process.exit(1);
    }
};

migrate();
