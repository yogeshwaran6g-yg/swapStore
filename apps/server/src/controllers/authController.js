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
