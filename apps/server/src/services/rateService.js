import { queryRunner } from '../config/db.js';
import { returnServiceResponse } from '../utils/responseUtils.js';

export const getExchangeRates = async () => {
  try {
    const rates = await queryRunner('SELECT token_symbol, network, inr_rate FROM exchange_rates');
    
    const rateMap = {};
    if (rates && rates.length > 0) {
      rates.forEach(r => {
        const key = r.network !== 'DEFAULT' ? `${r.token_symbol}_${r.network}` : r.token_symbol;
        rateMap[key] = parseFloat(r.inr_rate);
      });
    }

    return returnServiceResponse(true, { rates: rateMap });
  } catch (error) {
    console.error('Error fetching exchange rates from db:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

export const updateRate = async (tokenSymbol, network, inrRate, adminId) => {
  try {
    const net = network || 'DEFAULT';
    const result = await queryRunner(
      `INSERT INTO exchange_rates (token_symbol, network, inr_rate, admin_id, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) 
       ON DUPLICATE KEY UPDATE 
          inr_rate = VALUES(inr_rate), 
          admin_id = VALUES(admin_id), 
          updated_at = CURRENT_TIMESTAMP`,
      [tokenSymbol, net, inrRate, adminId]
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
