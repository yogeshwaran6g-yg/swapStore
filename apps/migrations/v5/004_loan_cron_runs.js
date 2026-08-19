import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Migration v5-006: Creating loan_cron_runs table...");

        await queryRunner(`
            CREATE TABLE IF NOT EXISTS loan_cron_runs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                run_type          ENUM('auto_scheduled', 'admin_all', 'admin_specific') NOT NULL,
                triggered_by      INT            DEFAULT NULL,

                target_user_uid   BINARY(16)     DEFAULT NULL,
                target_loan_uid   BINARY(16)     DEFAULT NULL,

                run_status        ENUM('running', 'completed', 'partial', 'failed') DEFAULT 'running',
                total_loans_processed    INT     NOT NULL DEFAULT 0,
                successful_collections   INT     NOT NULL DEFAULT 0,
                failed_collections       INT     NOT NULL DEFAULT 0,
                overdue_flagged          INT     NOT NULL DEFAULT 0,

                total_interest_collected DECIMAL(36,18) NOT NULL DEFAULT 0,

                error_log         TEXT           DEFAULT NULL,

                started_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
                completed_at      TIMESTAMP      NULL,

                CONSTRAINT fk_cron_admin FOREIGN KEY (triggered_by) REFERENCES admins(id) ON DELETE SET NULL,

                KEY idx_cron_type (run_type),
                KEY idx_cron_status (run_status),
                KEY idx_cron_started (started_at)
            ) ENGINE=InnoDB;
        `);

        console.log("✅ Created loan_cron_runs table");
        console.log("Migration v5-006 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration v5-006 failed:", err);
        process.exit(1);
    }
};

migrate();
