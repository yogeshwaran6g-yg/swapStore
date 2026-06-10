import 'dotenv/config';
import { queryRunner } from './src/config/db.js';

const migrate = async () => {
    try {
        console.log("Creating admins table...");
        await queryRunner(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);
        console.log("Admins table created.");

        console.log("Creating exchange_rates table if not exists...");
        await queryRunner(`
            CREATE TABLE IF NOT EXISTS exchange_rates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token_symbol VARCHAR(10) NOT NULL,
                network VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
                inr_rate DECIMAL(10, 2) NOT NULL,
                admin_id INT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_token_network (token_symbol, network),
                CONSTRAINT fk_rates_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);
        console.log("exchange_rates table created/verified.");

        console.log("Creating swap_orders table if not exists...");
        await queryRunner(`
            CREATE TABLE IF NOT EXISTS swap_orders (
                uid BINARY(16) PRIMARY KEY,
                order_id BINARY(16) NOT NULL UNIQUE,
                user_uid BINARY(16) NOT NULL,
                token_address VARCHAR(100) NOT NULL,
                amount DECIMAL(36, 18) NOT NULL,
                network VARCHAR(50) NOT NULL,
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                tx_hash VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_swap_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,
                KEY idx_swap_status (status),
                KEY idx_swap_order_id (order_id)
            ) ENGINE=InnoDB;
        `);
        console.log("swap_orders table created/verified.");

        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
