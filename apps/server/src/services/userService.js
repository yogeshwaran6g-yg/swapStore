import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { queryRunner } from '../config/db.js';
import env from '../config/env.js';
import { returnServiceResponse } from '../utils/responseUtils.js';

/**
 * Save bank details for an EXISTING user (already created via wallet login).
 * Also updates their profile fields (email, phone, username).
 */
export const saveBankDetails = async (userUid, { email, phone, account_no, name, ifsc }) => {
  try {
    // 1. Update the existing user's profile info
    const updateResult = await queryRunner(
      `UPDATE users SET email = ?, phone = ?, username = ?, updated_at = CURRENT_TIMESTAMP
       WHERE uid = UNHEX(?)`,
      [email || null, phone, name, userUid]
    );

    if (!updateResult || updateResult.affectedRows === 0) {
      return returnServiceResponse(false, null, 'User not found for profile update');
    }

    // 2. Check if bank account already exists for this user
    const existingBank = await queryRunner(
      `SELECT HEX(uid) as uid FROM user_bank_accounts WHERE user_uid = UNHEX(?) LIMIT 1`,
      [userUid]
    );

    if (Array.isArray(existingBank) && existingBank.length > 0) {
      // Update existing bank details
      const bankUpdate = await queryRunner(
        `UPDATE user_bank_accounts 
         SET account_holder_name = ?, account_number = ?, ifsc_code = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_uid = UNHEX(?)`,
        [name, account_no, ifsc, userUid]
      );

      if (!bankUpdate || bankUpdate.affectedRows === 0) {
        return returnServiceResponse(false, null, 'Failed to update bank details');
      }
    } else {
      // Insert new bank account
      const bankIdStr = uuidv4();
      const hexBankId = bankIdStr.replace(/-/g, '');
      const bankInsert = await queryRunner(
        `INSERT INTO user_bank_accounts (uid, user_uid, account_holder_name, account_number, ifsc_code, bank_name)
         VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?)`,
        [hexBankId, userUid, name, account_no, ifsc, 'Unknown']
      );

      if (!bankInsert || bankInsert.affectedRows === 0) {
        return returnServiceResponse(false, null, 'Failed to insert bank details');
      }
    }

    return returnServiceResponse(true);
  } catch (error) {
    console.error('Error in saveBankDetails service:', error);
    return returnServiceResponse(false, null, error.message);
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

    if (!Array.isArray(rows)) {
      return returnServiceResponse(false, null, 'Invalid query result');
    }

    if (rows.length > 0) {
      return returnServiceResponse(true, { user: rows[0] });
    }
    return returnServiceResponse(true, { user: null });
  } catch (error) {
    console.error('Error in getUserByWallet service:', error);
    return returnServiceResponse(false, null, error.message);
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

    if (!Array.isArray(rows) || rows.length === 0) {
      return returnServiceResponse(false, null, 'User not found');
    }

    return returnServiceResponse(true, { user: rows[0] });
  } catch (error) {
    console.error('Error in getUserByUid service:', error);
    return returnServiceResponse(false, null, error.message);
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
    const rows = await queryRunner(userQuery, [walletAddress]);

    if (!Array.isArray(rows)) {
      return returnServiceResponse(false, null, 'Database query failed');
    }

    let uidStr = '';

    if (rows.length > 0) {
      uidStr = rows[0].uid;
      const updateResult = await queryRunner(
        `UPDATE users SET last_login_at = CURRENT_TIMESTAMP
         WHERE wallet_address = ?`, [walletAddress]
      );

      if (!updateResult || updateResult.affectedRows === 0) {
        return returnServiceResponse(false, null, 'Failed to update login timestamp');
      }
    } else {
      const userIdStr = uuidv4();
      const hexUserId = userIdStr.replace(/-/g, '');
      const dummyEmail = `${walletAddress}@swapstore.local`;

      const insertResult = await queryRunner(
        `INSERT INTO users (uid, email, wallet_address, last_login_at) 
         VALUES (UNHEX(?), ?, ?, CURRENT_TIMESTAMP)`,
        [hexUserId, dummyEmail, walletAddress]
      );

      if (!insertResult || insertResult.affectedRows === 0) {
        return returnServiceResponse(false, null, 'Failed to create new user');
      }

      uidStr = hexUserId;
    }

    const token = jwt.sign(
      { uid: uidStr, wallet_address: walletAddress },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    return returnServiceResponse(true, { token, uid: uidStr });
  } catch (error) {
    console.error('Error in loginOrSignupByWallet:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

export const createSwapOrder = async (userUid, { tokenAddress, amount, network, tokenSymbol }) => {
  try {
    // 1. Check for rate limits (no more than 5 initiated orders in the last 48 hours)
    const pendingOrders = await queryRunner(
      `SELECT COUNT(*) as count FROM swap_orders 
       WHERE user_uid = UNHEX(?) 
         AND user_crypto_payment_status = 'initiated' 
         AND created_at >= NOW() - INTERVAL 48 HOUR`,
      [userUid]
    );

    if (pendingOrders && pendingOrders[0].count >= 5) {
      return returnServiceResponse(false, null, 'You have too many pending swap requests. Please complete or cancel them before creating a new one.');
    }

    // 2. Generate Order IDs
    const orderIdStr = uuidv4();
    const hexOrderId = orderIdStr.replace(/-/g, '');
    const orderIdBytes32 = '0x' + hexOrderId + '00000000000000000000000000000000';
    
    // 3. Insert order with new schema
    const insertResult = await queryRunner(
      `INSERT INTO swap_orders (uid, order_id, user_uid, token_address, token_symbol, amount, network, user_crypto_payment_status, admin_inr_payment_status)
       VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, ?, ?, 'initiated', 'pending')`,
      [uuidv4().replace(/-/g, ''), hexOrderId, userUid, tokenAddress, tokenSymbol || null, amount, network]
    );

    if (!insertResult || insertResult.affectedRows === 0) {
      return returnServiceResponse(false, null, 'Failed to insert swap order');
    }

    // Return the bytes32 formatted orderId for the smart contract
    return returnServiceResponse(true, { orderId: orderIdBytes32 });
  } catch (error) {
    console.error('Error in createSwapOrder:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

