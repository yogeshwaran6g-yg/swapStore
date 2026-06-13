import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const exchangeRateService = {
  getRates: async () => {
    try {
      const response = await apiClient.get(endpoints.RATES.GET);
      return response?.data?.ratesList || [];
    } catch (err) {
      console.log("err from exchangeRateService getRates ", err.message);
      throw err;
    }
  },

  addRate: async (data) => {
    try {
      const response = await apiClient.post(endpoints.RATES.ADMIN, data);
      return response;
    } catch (err) {
      console.log("err from exchangeRateService addRate ", err.message);
      throw err;
    }
  },

  updateRate: async (data) => {
    try {
      const response = await apiClient.post(endpoints.RATES.ADMIN, data);
      return response;
    } catch (err) {
      console.log("err from exchangeRateService updateRate ", err.message);
      throw err;
    }
  }
};
