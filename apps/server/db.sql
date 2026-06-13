CREATE TABLE IF NOT EXISTS users (
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


CREATE TABLE IF NOT EXISTS user_bank_accounts (
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


CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_symbol VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    inr_rate DECIMAL(10, 2) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    admin_id INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_token_network (token_symbol, network),
    CONSTRAINT fk_rates_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;



CREATE TABLE IF NOT EXISTS swap_orders (
    uid BINARY(16) PRIMARY KEY,    
    order_id BINARY(32) NOT NULL UNIQUE,
    user_uid BINARY(16) NOT NULL,
    token_address VARCHAR(100) NOT NULL,
    token_symbol VARCHAR(10),
    amount DECIMAL(36, 18) NOT NULL,
    network VARCHAR(50) NOT NULL,
    user_crypto_payment_status ENUM('initiated', 'completed', 'failed') DEFAULT 'initiated',
    admin_inr_payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    tx_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_swap_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,
    KEY idx_swap_status (user_crypto_payment_status),
    KEY idx_swap_order_id (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('loan_interest_rate', '5.0');

CREATE TABLE IF NOT EXISTS kyc_documents (
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
