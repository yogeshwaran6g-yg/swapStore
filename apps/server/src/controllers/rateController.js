import { getExchangeRates, updateRate as updateRateService } from '../services/rateService.js';
import { rtnRes } from '../utils/responseUtils.js';

export const fetchRates = async (req, res) => {
  try {
    const result = await getExchangeRates();

    if (result.success) {
      return rtnRes(res, 200, 'Rates fetched successfully', { rates: result.rates, ratesList: result.ratesList });
    } else {
      return rtnRes(res, 500, 'Failed to fetch exchange rates', { error: result.error });
    }
  } catch (error) {
    console.error('Error in fetchRates controller:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};

export const updateRate = async (req, res) => {
  try {
    const { tokenSymbol, network, inrRate, isActive } = req.body;
    const adminId = req.user?.id; // Set by adminAuthMiddleware

    if (!tokenSymbol || inrRate === undefined || !network) {
      return rtnRes(res, 400, 'tokenSymbol, network, and inrRate are required');
    }


    if (inrRate < 1) {
      return rtnRes(res, 400, 'inrRate must be greater then 0');
    }

    const result = await updateRateService(tokenSymbol, network, inrRate, isActive, adminId);

    if (result.success) {
      return rtnRes(res, 200, 'Rate updated successfully');
    } else {
      return rtnRes(res, 500, 'Failed to update rate', { error: result.error });
    }
  } catch (error) {
    console.error('Error in updateRate controller:', error);
    return rtnRes(res, 500, 'Internal Server Error', { error: error.message });
  }
};
