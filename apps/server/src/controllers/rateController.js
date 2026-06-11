import { getExchangeRates, updateRate as updateRateService } from '../services/rateService.js';
import { returnResponse } from '../utils/responseUtils.js';

export const fetchRates = async (req, res) => {
  try {
    const result = await getExchangeRates();

    if (result.success) {
      return returnResponse(res, 200, true, 'Rates fetched successfully', { rates: result.rates });
    } else {
      return returnResponse(res, 500, false, 'Failed to fetch exchange rates', null, result.error);
    }
  } catch (error) {
    console.error('Error in fetchRates controller:', error);
    return returnResponse(res, 500, false, 'Internal Server Error', null, error.message);
  }
};

export const updateRate = async (req, res) => {
  try {
    const { tokenSymbol, network, inrRate } = req.body;
    const adminId = req.user?.id; // Set by adminAuthMiddleware

    if (!tokenSymbol || !inrRate) {
      return returnResponse(res, 400, false, 'tokenSymbol and inrRate are required');
    }

    const result = await updateRateService(tokenSymbol, network, inrRate, adminId);

    if (result.success) {
      return returnResponse(res, 200, true, 'Rate updated successfully');
    } else {
      return returnResponse(res, 500, false, 'Failed to update rate', null, result.error);
    }
  } catch (error) {
    console.error('Error in updateRate controller:', error);
    return returnResponse(res, 500, false, 'Internal Server Error', null, error.message);
  }
};
