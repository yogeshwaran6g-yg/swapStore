import 'dotenv/config';
import { queryRunner } from '../../server/src/config/db.js';

const migrate = async () => {
    try {
        console.log("Upgrading swap_orders table...");

        try {
            // Drop old index if it exists
            await queryRunner("ALTER TABLE swap_orders DROP INDEX idx_swap_status;");
        } catch (e) {
            // Ignore if index doesn't exist
        }

        try {
            await queryRunner("ALTER TABLE swap_orders CHANGE status user_crypto_payment_status ENUM('initiated', 'completed', 'failed') DEFAULT 'initiated';");
            console.log("Renamed status -> user_crypto_payment_status");
            // Re-create index on new column name
            await queryRunner("ALTER TABLE swap_orders ADD INDEX idx_swap_status (user_crypto_payment_status);");
        } catch (e) {
            if (!e.message.includes("Unknown column 'status'")) {
                console.warn("Notice: " + e.message);
            }
        }

        try {
            await queryRunner("ALTER TABLE swap_orders ADD COLUMN admin_inr_payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending';");
            console.log("Added admin_inr_payment_status column");
        } catch (e) {
            if (!e.message.includes("Duplicate column name")) {
                console.warn("Notice: " + e.message);
            }
        }

        try {
            await queryRunner("ALTER TABLE swap_orders ADD COLUMN token_symbol VARCHAR(10);");
            console.log("Added token_symbol column");
        } catch (e) {
            if (!e.message.includes("Duplicate column name")) {
                console.warn("Notice: " + e.message);
            }
        }

        console.log("Migration 001 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
