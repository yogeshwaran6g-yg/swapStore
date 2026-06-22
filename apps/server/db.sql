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

INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES 
('loan_eligibility_tiers', '[{"token":"USDT","network":"bsc","min_balance":50,"max_loan":100},{"token":"USDT","network":"polygon","min_balance":50,"max_loan":100},{"token":"USDC","network":"bsc","min_balance":50,"max_loan":100},{"token":"USDC","network":"polygon","min_balance":50,"max_loan":100},{"token":"DAI","network":"bsc","min_balance":50,"max_loan":100},{"token":"DAI","network":"polygon","min_balance":50,"max_loan":100}]'),
('loan_fees', '1'),
('loan_interest_rate', '5.0'),
('loan_interest_calc_basis', 'original'),
('loan_interest_frequency_days', '30'),
('loan_default_term_days', '90'),
('loan_grace_period_days', '3'),
('loan_default_threshold_days', '90'),
('loan_auto_close_on_maturity', '1');

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

CREATE TABLE IF NOT EXISTS loans (
    uid BINARY(16) PRIMARY KEY,
    user_uid BINARY(16) NOT NULL,
    loan_id BINARY(32) UNIQUE,
    principal_amount DECIMAL(36, 18) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    token_symbol VARCHAR(10) DEFAULT NULL,
    token_address VARCHAR(100) DEFAULT NULL,
    network VARCHAR(50) DEFAULT NULL,
    disbursed_amount DECIMAL(36,18) DEFAULT NULL,
    disbursement_fee DECIMAL(36,18) DEFAULT NULL,
    disbursement_tx_hash VARCHAR(100) DEFAULT NULL,
    disbursed_at TIMESTAMP NULL,
    total_interest_paid DECIMAL(36,18) NOT NULL DEFAULT 0,
    pending_interest_due DECIMAL(36,18) NOT NULL DEFAULT 0,
    total_principal_paid DECIMAL(36,18) NOT NULL DEFAULT 0,
    outstanding_principal DECIMAL(36,18) DEFAULT NULL,
    is_overdue TINYINT(1) NOT NULL DEFAULT 0,
    overdue_since TIMESTAMP NULL,
    overdue_count INT NOT NULL DEFAULT 0,
    loan_term_days INT DEFAULT 30,
    maturity_date TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    status ENUM('pending', 'approved', 'active', 'overdue', 'defaulted', 'repaid', 'rejected', 'closed') DEFAULT 'pending',
    next_debit_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,
    KEY idx_loan_user (user_uid),
    KEY idx_loan_status (status),
    KEY idx_loan_overdue (is_overdue),
    KEY idx_loan_maturity (maturity_date),
    KEY idx_loan_network (network)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_interest_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_uid          BINARY(16)     NOT NULL,
    user_uid          BINARY(16)     NOT NULL,
    interest_amount   DECIMAL(36,18) NOT NULL,
    collected_amount  DECIMAL(36,18) DEFAULT 0,
    interest_rate     DECIMAL(5,2)   NOT NULL,
    principal_at_time DECIMAL(36,18) NOT NULL,
    period_start      TIMESTAMP      NOT NULL,
    period_end        TIMESTAMP      NOT NULL,
    collection_status ENUM('pending', 'collecting', 'collected', 'partial', 'failed', 'skipped', 'overdue') DEFAULT 'pending',
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
    payment_source    ENUM('user_initiated', 'cron_auto', 'admin_manual') DEFAULT 'user_initiated',
    confirmed_at      TIMESTAMP      NULL,
    created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_principal_loan FOREIGN KEY (loan_uid) REFERENCES loans(uid) ON DELETE CASCADE,
    CONSTRAINT fk_principal_user FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE,
    KEY idx_principal_loan (loan_uid),
    KEY idx_principal_user (user_uid),
    KEY idx_principal_status (payment_status)
) ENGINE=InnoDB;

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

