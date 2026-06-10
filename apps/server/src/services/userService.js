import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { queryRunner } from '../config/db.js';
import env from '../config/env.js';

/**
 * Save bank details for an EXISTING user (already created via wallet login).
 * Also updates their profile fields (email, phone, username).
 */
export const saveBankDetails = async (userUid, { email, phone, account_no, name, ifsc }) => {
  try {
    // 1. Update the existing user's profile info
    await queryRunner(
      `UPDATE users SET email = ?, phone = ?, username = ?, updated_at = CURRENT_TIMESTAMP
       WHERE uid = UNHEX(?)`,
      [email || null, phone, name, userUid]
    );

    // 2. Check if bank account already exists for this user
    const existingBank = await queryRunner(
      `SELECT HEX(uid) as uid FROM user_bank_accounts WHERE user_uid = UNHEX(?) LIMIT 1`,
      [userUid]
    );

    if (existingBank && existingBank.length > 0) {
      // Update existing bank details
      await queryRunner(
        `UPDATE user_bank_accounts 
         SET account_holder_name = ?, account_number = ?, ifsc_code = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_uid = UNHEX(?)`,
        [name, account_no, ifsc, userUid]
      );
    } else {
      // Insert new bank account
      const bankIdStr = uuidv4();
      const hexBankId = bankIdStr.replace(/-/g, '');
      await queryRunner(
        `INSERT INTO user_bank_accounts (uid, user_uid, account_holder_name, account_number, ifsc_code, bank_name)
         VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?)`,
        [hexBankId, userUid, name, account_no, ifsc, 'Unknown']
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveBankDetails service:', error);
    return { success: false, error: error.message };
  }
};

export const getUserByWallet = async (walletAddress) => {
  try {
    const userQuery = `
      SELECT HEX(u.uid) as uid, u.email, u.phone, u.username, u.wallet_address,
             b.account_holder_name, b.account_number, b.ifsc_code
      FROM users u
      LEFT JOIN user_bank_accounts b ON u.uid = b.user_uid
      WHERE u.wallet_address = ?
      LIMIT 1
    `;
    const rows = await queryRunner(userQuery, [walletAddress]);

    if (rows && rows.length > 0) {
      return { success: true, user: rows[0] };
    }
    return { success: true, user: null };
  } catch (error) {
    console.error('Error in getUserByWallet service:', error);
    return { success: false, error: error.message };
  }
};

export const getUserByUid = async (uid) => {
  try {
    const userQuery = `
      SELECT HEX(u.uid) as uid, u.email, u.phone, u.username, u.wallet_address,
             u.kyc_status, u.email_verified, u.phone_verified,
             b.account_holder_name, b.account_number, b.ifsc_code, b.bank_name
      FROM users u
      LEFT JOIN user_bank_accounts b ON u.uid = b.user_uid
      WHERE u.uid = UNHEX(?)
      LIMIT 1
    `;
    const rows = await queryRunner(userQuery, [uid]);

    if (rows && rows.length > 0) {
      return { success: true, user: rows[0] };
    }
    return { success: true, user: null };
  } catch (error) {
    console.error('Error in getUserByUid service:', error);
    return { success: false, error: error.message };
  }
};

export const loginOrSignupByWallet = async (walletAddress) => {
  try {
    const userQuery = `
      SELECT HEX(u.uid) as uid, u.wallet_address
      FROM users u
      WHERE u.wallet_address = ?
      LIMIT 1
    `;
    let rows = await queryRunner(userQuery, [walletAddress]);
    let uidStr = '';

    if (rows && rows.length > 0) {
      // User exists, update last_login_at
      uidStr = rows[0].uid;
      await queryRunner(
                  `UPDATE users SET last_login_at = CURRENT_TIMESTAMP
                   WHERE wallet_address = ?`, [walletAddress]);
    } else {
      // Create new user
      const userIdStr = uuidv4();
      const hexUserId = userIdStr.replace(/-/g, '');
      const insertQuery = `
        INSERT INTO users (uid, email, wallet_address, last_login_at) 
        VALUES (UNHEX(?), ?, ?, CURRENT_TIMESTAMP)
      `;
      // Provide a dummy email since it's NOT NULL and UNIQUE, but wait!
      // In db.sql, email is NOT NULL and UNIQUE KEY uk_users_email.
      // So we have to generate a dummy email if we don't have it.
      const dummyEmail = `${userIdStr}@wallet.local`;
      await queryRunner(insertQuery, [hexUserId, dummyEmail, walletAddress]);
      uidStr = hexUserId;
    }

    // Generate JWT
    const token = jwt.sign(
      { uid: uidStr, wallet_address: walletAddress },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    return { success: true, token, uid: uidStr };
  } catch (error) {
    console.error('Error in loginOrSignupByWallet:', error);
    return { success: false, error: error.message };
  }
};

export const createSwapOrder = async (userUid, { tokenAddress, amount, network }) => {
  try {
    const orderIdStr = uuidv4();
    const hexOrderId = orderIdStr.replace(/-/g, '');
    const orderIdBytes32 = '0x' + hexOrderId + '00000000000000000000000000000000'; // Make it 32 bytes for Solidity bytes32
    
    // We actually just need a unique 32-byte hex string. uuid without dashes is 32 chars (16 bytes). 
    // Wait, uuid is 16 bytes. Solidity bytes32 is 32 bytes (64 hex chars).
    // Let's use the uuid and pad it to 32 bytes (64 chars) for the frontend to use.
    // However, the DB expects BINARY(16) for order_id. So we save the 16 byte UUID in DB,
    // and the frontend can pad it to 32 bytes when calling the contract.
    
    await queryRunner(
      `INSERT INTO swap_orders (uid, order_id, user_uid, token_address, amount, network, status)
       VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, ?, 'pending')`,
      [uuidv4().replace(/-/g, ''), hexOrderId, userUid, tokenAddress, amount, network]
    );

    // Return the bytes32 formatted orderId for the smart contract
    return { success: true, orderId: orderIdBytes32 };
  } catch (error) {
    console.error('Error in createSwapOrder:', error);
    return { success: false, error: error.message };
  }
};
