import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { queryRunner } from '../config/db.js';
import env from '../config/env.js';
import { returnServiceResponse } from '../utils/responseUtils.js';

/**
 * Save/update bank details for an EXISTING user.
 * Only touches fields that are explicitly provided — never wipes undefined fields.
 * Profile fields (email, phone, username) are optional and only updated if passed.
 */
export const saveBankDetails = async (userUid, { email, phone, username, account_no, name, ifsc }) => {
  try {
    // 1. Partial update for users table — only fields that were actually sent
    const userUpdates = [];
    const userValues = [];

    if (email !== undefined)    { userUpdates.push('email = ?');    userValues.push(email || null); }
    if (phone !== undefined)    { userUpdates.push('phone = ?');    userValues.push(phone || null); }
    if (username !== undefined) { userUpdates.push('username = ?'); userValues.push(username || null); }

    if (userUpdates.length > 0) {
      userUpdates.push('updated_at = CURRENT_TIMESTAMP');
      userValues.push(userUid);
      const updateResult = await queryRunner(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE uid = UNHEX(?)`,
        userValues
      );
      if (!updateResult || updateResult.affectedRows === 0) {
        return returnServiceResponse(false, null, 'User not found');
      }
    }

    // 2. Bank account — insert or partial update
    const existingBank = await queryRunner(
      `SELECT HEX(uid) as uid FROM user_bank_accounts WHERE user_uid = UNHEX(?) LIMIT 1`,
      [userUid]
    );

    if (Array.isArray(existingBank) && existingBank.length > 0) {
      const bankUpdates = [];
      const bankValues = [];

      if (name !== undefined)       { bankUpdates.push('account_holder_name = ?'); bankValues.push(name); }
      if (account_no !== undefined) { bankUpdates.push('account_number = ?');      bankValues.push(account_no); }
      if (ifsc !== undefined)       { bankUpdates.push('ifsc_code = ?');            bankValues.push(ifsc); }

      if (bankUpdates.length > 0) {
        bankUpdates.push('updated_at = CURRENT_TIMESTAMP');
        bankValues.push(userUid);
        const bankUpdate = await queryRunner(
          `UPDATE user_bank_accounts SET ${bankUpdates.join(', ')} WHERE user_uid = UNHEX(?)`,
          bankValues
        );
        if (!bankUpdate || bankUpdate.affectedRows === 0) {
          return returnServiceResponse(false, null, 'Failed to update bank details');
        }
      }
    } else {
      if (!name || !account_no || !ifsc) {
        return returnServiceResponse(false, null, 'name, account_no, and ifsc are required to add bank details');
      }
      const hexBankId = uuidv4().replace(/-/g, '');
      const bankInsert = await queryRunner(
        `INSERT INTO user_bank_accounts (uid, user_uid, account_holder_name, account_number, ifsc_code, bank_name)
         VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, 'Unknown')`,
        [hexBankId, userUid, name, account_no, ifsc]
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

/**
 * Full profile by UID — users + bank + latest KYC document.
 */
export const getUserByUid = async (uid) => {
  try {
    const rows = await queryRunner(
      `SELECT
         HEX(u.uid) AS uid,
         u.email, u.phone, u.username, u.wallet_address,
         u.kyc_status, u.email_verified, u.phone_verified,
         u.is_blocked, u.last_login_at, u.created_at,
         b.account_holder_name, b.account_number, b.ifsc_code, b.bank_name,
         k.document_type  AS kyc_document_type,
         k.document_url   AS kyc_document_url,
         k.status         AS kyc_document_status,
         k.uploaded_at    AS kyc_uploaded_at
       FROM users u
       LEFT JOIN user_bank_accounts b ON u.uid = b.user_uid
       LEFT JOIN user_kyc_documents k ON u.uid = k.user_uid
         AND k.id = (SELECT MAX(id) FROM user_kyc_documents WHERE user_uid = u.uid)
       WHERE u.uid = UNHEX(?)
       LIMIT 1`,
      [uid]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return returnServiceResponse(false, null, 'User not found');
    }

    return returnServiceResponse(true, { user: rows[0] });
  } catch (error) {
    console.error('Error in getUserByUid service:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

/**
 * Full profile by wallet address — same shape as getUserByUid.
 */
export const getUserByWallet = async (walletAddress) => {
  try {
    const rows = await queryRunner(
      `SELECT
         HEX(u.uid) AS uid,
         u.email, u.phone, u.username, u.wallet_address,
         u.kyc_status, u.email_verified, u.phone_verified,
         u.is_blocked, u.last_login_at,
         b.account_holder_name, b.account_number, b.ifsc_code, b.bank_name,
         k.document_type  AS kyc_document_type,
         k.document_url   AS kyc_document_url,
         k.status         AS kyc_document_status,
         k.uploaded_at    AS kyc_uploaded_at
       FROM users u
       LEFT JOIN user_bank_accounts b ON u.uid = b.user_uid
       LEFT JOIN user_kyc_documents k ON u.uid = k.user_uid
         AND k.id = (SELECT MAX(id) FROM user_kyc_documents WHERE user_uid = u.uid)
       WHERE u.wallet_address = ?
       LIMIT 1`,
      [walletAddress]
    );

    if (!Array.isArray(rows)) {
      return returnServiceResponse(false, null, 'Invalid query result');
    }

    return returnServiceResponse(true, { user: rows.length > 0 ? rows[0] : null });
  } catch (error) {
    console.error('Error in getUserByWallet service:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

export const loginOrSignupByWallet = async (walletAddress) => {
  try {
    const rows = await queryRunner(
      `SELECT HEX(uid) as uid, wallet_address FROM users WHERE wallet_address = ? LIMIT 1`,
      [walletAddress]
    );

    if (!Array.isArray(rows)) {
      return returnServiceResponse(false, null, 'Database query failed');
    }

    let uidStr = '';

    if (rows.length > 0) {
      uidStr = rows[0].uid;
      await queryRunner(
        `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE wallet_address = ?`,
        [walletAddress]
      );
    } else {
      const hexUserId = uuidv4().replace(/-/g, '');
      const dummyEmail = `${walletAddress.toLowerCase()}@swapstore.local`;

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

    const hexOrderId = uuidv4().replace(/-/g, '');
    const orderIdBytes32 = '0x' + hexOrderId + '00000000000000000000000000000000';

    const insertResult = await queryRunner(
      `INSERT INTO swap_orders (uid, order_id, user_uid, token_address, token_symbol, amount, network, user_crypto_payment_status, admin_inr_payment_status)
       VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, ?, ?, 'initiated', 'pending')`,
      [uuidv4().replace(/-/g, ''), hexOrderId, userUid, tokenAddress, tokenSymbol || null, amount, network]
    );

    if (!insertResult || insertResult.affectedRows === 0) {
      return returnServiceResponse(false, null, 'Failed to insert swap order');
    }

    return returnServiceResponse(true, { orderId: orderIdBytes32 });
  } catch (error) {
    console.error('Error in createSwapOrder:', error);
    return returnServiceResponse(false, null, error.message);
  }
};
