import { getUserByUid, loginOrSignupByWallet } from '../services/userService.js';
import { returnResponse } from '../utils/responseUtils.js';

export const getProfile = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) {
      return returnResponse(res, 401, false, 'Unauthorized');
    }

    const result = await getUserByUid(userUid);

    if (result.success) {
      return returnResponse(res, 200, true, 'Profile fetched successfully', { user: result.user });
    } else {
      return returnResponse(res, 500, false, 'Failed to fetch profile', null, result.error);
    }
  } catch (error) {
    console.error('Error in getProfile:', error);
    return returnResponse(res, 500, false, 'Internal Server Error', null, error.message);
  }
};

export const walletLogin = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return returnResponse(res, 400, false, 'Wallet address is required');
    }

    const result = await loginOrSignupByWallet(address);

    if (result.success) {
      return returnResponse(res, 200, true, 'Login successful', { token: result.token, uid: result.uid });
    } else {
      return returnResponse(res, 500, false, 'Failed to authenticate user', null, result.error);
    }
  } catch (error) {
    console.error('Error in walletLogin:', error);
    return returnResponse(res, 500, false, 'Internal Server Error', null, error.message);
  }
};
