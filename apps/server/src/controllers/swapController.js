import { saveBankDetails, createSwapOrder } from '../services/userService.js';
import { returnResponse } from '../utils/responseUtils.js';

export const submitSwapForm = async (req, res) => {
  try {
    const userUid = req.user?.uid; // From JWT (set by userAuth middleware)
    if (!userUid) {
      return returnResponse(res, 401, false, 'Login required before submitting swap request');
    }

    const { email, phone, account_no, name, ifsc, tokenAddress, amount, network, tokenSymbol } = req.body;

    // Token and amount are strictly required
    if (!tokenAddress || !amount || !network) {
      return returnResponse(res, 400, false, 'Missing required swap details (token, amount, network)');
    }

    // Only update bank details if they are provided
    if (phone && account_no && name && ifsc) {
      const bankResult = await saveBankDetails(userUid, { email, phone, account_no, name, ifsc });
      if (!bankResult.success) {
        return returnResponse(res, 500, false, 'Failed to save bank details', null, bankResult.error);
      }
    }

    // Create the pending swap order
    const swapResult = await createSwapOrder(userUid, { tokenAddress, amount, network, tokenSymbol });

    if (swapResult.success) {
      return returnResponse(res, 200, true, 'Order created successfully', { orderId: swapResult.orderId });
    } else {
      return returnResponse(res, 500, false, 'Failed to create swap order', null, swapResult.error);
    }
  } catch (error) {
    console.error('Error in submitSwapForm:', error);
    return returnResponse(res, 500, false, 'Internal Server Error', null, error.message);
  }
};
