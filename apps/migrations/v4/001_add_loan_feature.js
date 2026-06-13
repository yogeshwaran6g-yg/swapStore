import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Adding Loan feature tables...");

        try {
            await queryRunner(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    setting_key VARCHAR(50) PRIMARY KEY,
                    setting_value VARCHAR(255) NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB;
            `);
            console.log("Created system_settings table");

            await queryRunner(`
                INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('loan_interest_rate', '5.0');
            `);
            console.log("Inserted default loan_interest_rate");
        } catch (e) {
            console.error("Error creating system_settings:", e);
        }

        try {
            await queryRunner(`
                CREATE TABLE IF NOT EXISTS user_kyc_documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_uid BINARY(16) NOT NULL,
                    document_type VARCHAR(50) NOT NULL,
                    document_url VARCHAR(255) NOT NULL,
                    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    CONSTRAINT fk_kyc_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,
                    KEY idx_kyc_user (user_uid)
                ) ENGINE=InnoDB;
            `);
            console.log("Created user_kyc_documents table");
        } catch (e) {
            console.error("Error creating user_kyc_documents:", e);
        }

        try {
            await queryRunner(`
                CREATE TABLE IF NOT EXISTS loans (
                    uid BINARY(16) PRIMARY KEY,
                    user_uid BINARY(16) NOT NULL,
                    loan_id BINARY(32) UNIQUE,
                    principal_amount DECIMAL(36, 18) NOT NULL,
                    interest_rate DECIMAL(5, 2) NOT NULL,
                    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
                    next_debit_date TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    CONSTRAINT fk_loan_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,
                    KEY idx_loan_user (user_uid),
                    KEY idx_loan_status (status)
                ) ENGINE=InnoDB;
            `);
            console.log("Created loans table");
        } catch (e) {
            console.error("Error creating loans:", e);
        }

        console.log("Migration v4 001 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
