import { rtnRes } from '../utils/responseUtils.js';

export const getAllUsers = async (req, res) => {
  try {
    // Role check
    if (req.user?.role !== 'admin') {
      return rtnRes(res, 403, 'Forbidden: Admins only');
    }

    const { queryRunner } = await import('../config/db.js');
    const users = await queryRunner(`
      SELECT 
        HEX(uid) as uid, 
        email, 
        phone, 
        username, 
        wallet_address,
        kyc_status, 
        is_blocked, 
        created_at, 
        last_login_at
      FROM users
      ORDER BY created_at DESC
    `);

    return rtnRes(res, 200, 'Users fetched successfully', { users: users || [] });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    // Role check
    if (req.user?.role !== 'admin') {
      return rtnRes(res, 403, 'Forbidden: Admins only');
    }

    const { uid } = req.params;
    const { is_blocked } = req.body;

    if (typeof is_blocked !== 'boolean') {
      return rtnRes(res, 400, 'Invalid is_blocked value. Must be a boolean.');
    }

    const { queryRunner } = await import('../config/db.js');
    
    // Convert boolean to tinyint
    const blockedValue = is_blocked ? 1 : 0;
    
    const result = await queryRunner(
      'UPDATE users SET is_blocked = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = UNHEX(?)',
      [blockedValue, uid]
    );

    if (result.affectedRows === 0) {
      return rtnRes(res, 404, 'User not found');
    }

    return rtnRes(res, 200, `User successfully ${is_blocked ? 'blocked' : 'unblocked'}`);
  } catch (error) {
    console.error('Error toggling user block status:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    // Role check
    if (req.user?.role !== 'admin') {
      return rtnRes(res, 403, 'Forbidden: Admins only');
    }

    const { uid } = req.params;

    const { queryRunner } = await import('../config/db.js');

    // 1. Fetch user basics
    const users = await queryRunner(`
      SELECT 
        HEX(uid) as uid, 
        email, 
        phone, 
        username, 
        wallet_address,
        email_verified,
        phone_verified,
        kyc_status, 
        is_blocked, 
        created_at, 
        last_login_at
      FROM users
      WHERE uid = UNHEX(?)
    `, [uid]);

    if (!users || users.length === 0) {
      return rtnRes(res, 404, 'User not found');
    }
    const user = users[0];

    // 2. Fetch Bank Accounts
    const bankAccounts = await queryRunner(`
      SELECT 
        account_holder_name,
        account_number,
        ifsc_code,
        bank_name,
        is_primary,
        created_at
      FROM user_bank_accounts
      WHERE user_uid = UNHEX(?)
      ORDER BY created_at DESC
    `, [uid]);

    // 3. Fetch KYC Documents
    const kycDocuments = await queryRunner(`
      SELECT 
        id,
        document_type,
        document_url,
        status,
        uploaded_at
      FROM user_kyc_documents
      WHERE user_uid = UNHEX(?)
      ORDER BY uploaded_at DESC
    `, [uid]);

    // Aggregate
    const userDetails = {
      ...user,
      bankAccounts: bankAccounts || [],
      kycDocuments: kycDocuments || []
    };

    return rtnRes(res, 200, 'User details fetched successfully', { user: userDetails });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};
