import { getExchangeRates, updateRate as updateRateService } from '../services/rateService.js';

export const fetchRates = async (req, res) => {
  try {
    const result = await getExchangeRates();

    if (result.success) {
      res.json(result.rates);
    } else {
      res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
  } catch (error) {
    console.error('Error in fetchRates controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateRate = async (req, res) => {
  try {
    const { tokenSymbol, network, inrRate } = req.body;
    const adminId = req.user?.id; // Set by adminAuthMiddleware

    if (!tokenSymbol || !inrRate) {
      return res.status(400).json({ error: 'tokenSymbol and inrRate are required' });
    }

    const result = await updateRateService(tokenSymbol, network, inrRate, adminId);

    if (result.success) {
      res.json({ message: 'Rate updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update rate' });
    }
  } catch (error) {
    console.error('Error in updateRate controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
