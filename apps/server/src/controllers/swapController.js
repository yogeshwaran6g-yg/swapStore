import { saveBankDetails, createSwapOrder } from '../services/userService.js';
import { rtnRes } from '../utils/responseUtils.js';
import { validateSwapRate } from '../services/rateService.js';

export const submitSwapForm = async (req, res) => {
  try {
    const userUid = req.user?.uid; // From JWT (set by userAuth middleware)
    if (!userUid) {
      return rtnRes(res, 401, 'Login required before submitting swap request');
    }

    const { email, phone, account_no, name, ifsc, tokenAddress, amount, network, tokenSymbol } = req.body;

    // Token and amount are strictly required
    if (!tokenAddress || !amount || !network) {
      return rtnRes(res, 400, 'Missing required swap details (token, amount, network)');
    }

    // Validate if the exchange rate is active and exists
    const rateValidation = await validateSwapRate(tokenSymbol, network);
    if (!rateValidation.success) {
      return rtnRes(res, 400, rateValidation.error || 'Invalid or inactive exchange rate for this token/network');
    }

    // Only update bank details if they are provided
    if (phone && account_no && name && ifsc) {
      const bankResult = await saveBankDetails(userUid, { email, phone, account_no, name, ifsc });
      if (!bankResult.success) {
        return rtnRes(res, 500, 'Failed to save bank details', { error: bankResult.error });
      }
    }

    // Create the pending swap order
    const swapResult = await createSwapOrder(userUid, { tokenAddress, amount, network, tokenSymbol });

    if (swapResult.success) {
      return rtnRes(res, 200, 'Order created successfully', { orderId: swapResult.orderId });
    } else {
      return rtnRes(res, 400, swapResult.error || 'Failed to create swap order', { error: swapResult.error });
    }
  } catch (error) {
    console.error('Error in submitSwapForm:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const getUserSwaps = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return rtnRes(res, 401, 'Unauthorized');

    const { queryRunner } = await import('../config/db.js');
    const swaps = await queryRunner(`
      SELECT 
        HEX(order_id) as order_id, token_symbol, amount, network,
        user_crypto_payment_status, admin_inr_payment_status, tx_hash, created_at
      FROM swap_orders 
      WHERE user_uid = UNHEX(?)
      ORDER BY created_at DESC
      LIMIT 50
    `, [userUid]);

    return rtnRes(res, 200, 'Swaps fetched successfully', { swaps: swaps || [] });
  } catch (error) {
    console.error('Error fetching user swaps:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const confirmSwap = async (req, res) => {
  try {
    const { orderId, txHash } = req.body;
    if (!orderId || !txHash) return rtnRes(res, 400, 'Missing orderId or txHash');

    const hexId = orderId.startsWith('0x') ? orderId.substring(2) : orderId;

    const { queryRunner } = await import('../config/db.js');
    const result = await queryRunner(
      `UPDATE swap_orders 
       SET user_crypto_payment_status = 'completed', tx_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = UNHEX(?) AND user_crypto_payment_status = 'initiated'`,
      [txHash, hexId]
    );

    if (result?.affectedRows > 0) {
      return rtnRes(res, 200, 'Swap confirmed successfully');
    }
    return rtnRes(res, 400, 'Swap order not found or already completed');
  } catch (error) {
    console.error('Error confirming swap:', error);
    return rtnRes(res, 500, 'Failed to confirm swap');
  }
};

export const getAllSwaps = async (req, res) => {
  try {
      // Role check
      if (req.user?.role !== 'admin') {
          return rtnRes(res, 403, 'Forbidden: Admins only');
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const { queryRunner } = await import('../config/db.js');

      const [{ total }] = await queryRunner('SELECT COUNT(*) as total FROM swap_orders');

      const swaps = await queryRunner(`
          SELECT 
              so.uid, HEX(so.order_id) as order_id, HEX(so.user_uid) as user_uid, 
              so.token_symbol, so.amount, so.network,
              so.user_crypto_payment_status, so.admin_inr_payment_status, so.tx_hash, so.created_at,
              u.username, u.email, u.phone, u.wallet_address,
              b.account_holder_name, b.account_number, b.ifsc_code, b.bank_name
          FROM swap_orders so
          JOIN users u ON so.user_uid = u.uid
          LEFT JOIN user_bank_accounts b ON so.user_uid = b.user_uid
          ORDER BY so.created_at DESC
          LIMIT ? OFFSET ?
      `, [limit, offset]);

      return rtnRes(res, 200, 'Swaps fetched successfully', {
        swaps: swaps || [],
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
  } catch (error) {
      console.error('Error fetching all swaps:', error);
      return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const updateSwapStatus = async (req, res) => {
  try {
      // Role check
      if (req.user?.role !== 'admin') {
          return rtnRes(res, 403, 'Forbidden: Admins only');
      }

      const { orderId } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'processing', 'completed', 'failed'].includes(status)) {
          return rtnRes(res, 400, 'Invalid status. Must be pending, processing, completed, or failed.');
      }

      const { queryRunner } = await import('../config/db.js');
      const result = await queryRunner(
          'UPDATE swap_orders SET admin_inr_payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = UNHEX(?)',
          [status, orderId]
      );

      if (result.affectedRows === 0) {
          return rtnRes(res, 404, 'Swap order not found');
      }

      return rtnRes(res, 200, 'Swap status updated successfully');
  } catch (error) {
      console.error('Error updating swap status:', error);
      return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};
