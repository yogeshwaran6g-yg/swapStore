import { queryRunner } from '../config/db.js';
import { returnServiceResponse } from '../utils/responseUtils.js';

export const getExchangeRates = async () => {
  try {
    const rates = await queryRunner('SELECT id, token_symbol, network, inr_rate, is_active, updated_at FROM exchange_rates');
    
    const rateMap = {};
    if (rates && rates.length > 0) {
      rates.forEach(r => {
        // Only include active rates in the map for the frontend
        if (r.is_active === 1) {
          const key = `${r.token_symbol}_${r.network}`;
          rateMap[key] = parseFloat(r.inr_rate);
        }
      });
    }

    return returnServiceResponse(true, { ratesList: rates || [], rates: rateMap });
  } catch (error) {
    console.error('Error fetching exchange rates from db:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

export const validateSwapRate = async (tokenSymbol, network) => {
  try {
    const rates = await queryRunner(
      'SELECT inr_rate FROM exchange_rates WHERE token_symbol = ? AND network = ? AND is_active = 1',
      [tokenSymbol, network]
    );
    if (!rates || rates.length === 0) {
      return returnServiceResponse(false, null, `Exchange rate not found or inactive for ${tokenSymbol} on ${network}`);
    }
    return returnServiceResponse(true, { rate: parseFloat(rates[0].inr_rate) });
  } catch (error) {
    console.error('Error validating swap rate:', error);
    return returnServiceResponse(false, null, 'Error validating exchange rate');
  }
};

export const updateRate = async (tokenSymbol, network, inrRate, isActive, adminId) => {
  try {
    // Determine active status: default to 1 if undefined, else use the provided value
    const activeFlag = isActive !== undefined ? (isActive ? 1 : 0) : 1;
    const result = await queryRunner(
      `INSERT INTO exchange_rates (token_symbol, network, inr_rate, is_active, admin_id, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) 
       ON DUPLICATE KEY UPDATE 
          inr_rate = VALUES(inr_rate), 
          is_active = VALUES(is_active),
          admin_id = VALUES(admin_id), 
          updated_at = CURRENT_TIMESTAMP`,
      [tokenSymbol, network, inrRate, activeFlag, adminId]
    );

    if (!result || result.affectedRows === 0) {
      return returnServiceResponse(false, null, 'Failed to insert or update exchange rate');
    }

    return returnServiceResponse(true);
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    return returnServiceResponse(false, null, error.message);
  }
};
