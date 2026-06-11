CREATE TABLE users (
    uid BINARY(16) PRIMARY KEY,

    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    wallet_address VARCHAR(100),

    email_verified TINYINT(1) NOT NULL DEFAULT 0,
    phone_verified TINYINT(1) NOT NULL DEFAULT 0,

    username VARCHAR(50),
    
    kyc_status ENUM(
        'pending',
        'submitted',
        'approved',
        'rejected'
    ) DEFAULT 'pending',

    is_blocked TINYINT(1) NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_phone (phone),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_wallet (wallet_address),

    KEY idx_users_created_at (created_at),
    KEY idx_users_kyc_status (kyc_status),
    KEY idx_users_last_login_at (last_login_at)
) ENGINE=InnoDB;


CREATE TABLE user_bank_accounts (
    uid BINARY(16) PRIMARY KEY,

    user_uid BINARY(16) NOT NULL,

    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,

    is_primary TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_bank_user
        FOREIGN KEY (user_uid)
        REFERENCES users(uid)
        ON DELETE CASCADE,

    KEY idx_bank_user_uid (user_uid)
) ENGINE=InnoDB;


CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_symbol VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
    inr_rate DECIMAL(10, 2) NOT NULL,
    admin_id INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_token_network (token_symbol, network),
    CONSTRAINT fk_rates_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Insert default admin rates
INSERT INTO exchange_rates (token_symbol, network, inr_rate) VALUES
('USDT', 'DEFAULT', 85.00),
('USDC', 'DEFAULT', 85.00),
('DAI', 'DEFAULT', 85.00);

CREATE TABLE swap_orders (
    uid BINARY(16) PRIMARY KEY,    
    order_id BINARY(32) NOT NULL UNIQUE,
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
