import apiClient from '@/utils/axios';
import { endpoints } from '@/config/constants';
import { toast } from "react-hot-toast";

/**
 * Fetch all exchange rates.
 * @returns {Promise<Record<string, number>>} e.g. { USDT: 85, USDC: 85, DAI: 85 }
 */
export const fetchRates = async () => {
  try {
    const response = await apiClient.get(endpoints.RATES.list);
    // The API returns { success: true, data: { rates: {...}, ratesList: [...] } }
    // The axios interceptor already unwraps the outer response.data, so `response` is the JSON body.
    return response?.data?.rates || response?.rates || {};
  } catch (err) {
    console.log("something went wrong unable to getRates", err.message);
    toast.error("something went wrong unable to getRates");
    throw err; // React Query requires errors to be thrown
  }
};
