import { getUserByUid, loginOrSignupByWallet } from '../services/userService.js';
import { rtnRes } from '../utils/responseUtils.js';

export const getProfile = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) {
      return rtnRes(res, 401, 'Unauthorized');
    }

    const result = await getUserByUid(userUid);

    if (result.success) {
      return rtnRes(res, 200, 'Profile fetched successfully', { user: result.user });
    } else {
      return rtnRes(res, 500, 'Failed to fetch profile', { error: result.error });
    }
  } catch (error) {
    console.error('Error in getProfile:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const walletLogin = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return rtnRes(res, 400, 'Wallet address is required');
    }

    const result = await loginOrSignupByWallet(address);

    if (result.success) {
      return rtnRes(res, 200, 'Login successful', { token: result.token, uid: result.uid });
    } else {
      return rtnRes(res, 500, 'Failed to authenticate user', { error: result.error });
    }
  } catch (error) {
    console.error('Error in walletLogin:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) {
      return rtnRes(res, 401, 'Unauthorized');
    }

    const { username, email, phone } = req.body;
    
    // Validate that we only update allowed fields
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return rtnRes(res, 400, 'No valid fields provided for update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userUid);

    const { queryRunner } = await import('../config/db.js');
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE uid = UNHEX(?)`;
    await queryRunner(updateQuery, values);

    // Fetch the updated user
    const { getUserByUid } = await import('../services/userService.js');
    const result = await getUserByUid(userUid);

    if (result.success) {
      return rtnRes(res, 200, 'Profile updated successfully', { user: result.user });
    } else {
      return rtnRes(res, 500, 'Failed to fetch updated profile', { error: result.error });
    }

  } catch (error) {
    console.error('Error updating profile:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) {
      return rtnRes(res, 401, 'Unauthorized');
    }

    const { name, account_no, ifsc } = req.body;
    
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('account_holder_name = ?');
      values.push(name);
    }
    if (account_no !== undefined) {
      updates.push('account_number = ?');
      values.push(account_no);
    }
    if (ifsc !== undefined) {
      updates.push('ifsc_code = ?');
      values.push(ifsc);
    }

    if (updates.length === 0) {
      return rtnRes(res, 400, 'No valid fields provided for update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userUid);

    const { queryRunner } = await import('../config/db.js');
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE uid = UNHEX(?)`;
    await queryRunner(updateQuery, values);

    const { getUserByUid } = await import('../services/userService.js');
    const result = await getUserByUid(userUid);

    if (result.success) {
      return rtnRes(res, 200, 'Bank details updated successfully', { user: result.user });
    } else {
      return rtnRes(res, 500, 'Failed to fetch updated profile', { error: result.error });
    }

  } catch (error) {
    console.error('Error updating bank details:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};
