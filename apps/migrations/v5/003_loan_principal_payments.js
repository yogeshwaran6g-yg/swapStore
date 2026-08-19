import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Migration v5-004: Creating loan_principal_payments table...");

        await queryRunner(`
            CREATE TABLE IF NOT EXISTS loan_principal_payments (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                loan_uid          BINARY(16)     NOT NULL,
                user_uid          BINARY(16)     NOT NULL,

                payment_amount    DECIMAL(36,18) NOT NULL,
                principal_before  DECIMAL(36,18) NOT NULL,
                principal_after   DECIMAL(36,18) NOT NULL,

                tx_hash           VARCHAR(100)   DEFAULT NULL,
                wallet_address    VARCHAR(100)   DEFAULT NULL,
                token_symbol      VARCHAR(10)    DEFAULT NULL,
                network           VARCHAR(50)    DEFAULT NULL,

                payment_status    ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
                payment_source    ENUM(
                    'user_initiated',
                    'cron_auto',
                    'admin_manual'
                ) DEFAULT 'user_initiated',

                confirmed_at      TIMESTAMP      NULL,
                created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
                updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                CONSTRAINT fk_principal_loan FOREIGN KEY (loan_uid) REFERENCES loans(uid) ON DELETE CASCADE,
                CONSTRAINT fk_principal_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,

                KEY idx_principal_loan (loan_uid),
                KEY idx_principal_user (user_uid),
                KEY idx_principal_status (payment_status)
            ) ENGINE=InnoDB;
        `);

        console.log("✅ Created loan_principal_payments table");
        console.log("Migration v5-004 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration v5-004 failed:", err);
        process.exit(1);
    }
};

migrate();
