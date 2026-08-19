import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const cronService = {
  runInterestCollection: async (payload = {}) => {
    try {
      const response = await apiClient.post(endpoints.CRON.RUN_INTEREST, payload);
      return response;
    } catch (err) {
      console.error("err from cronService runInterestCollection", err.message);
      throw err;
    }
  },

  getCronHistory: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const response = await apiClient.get(endpoints.CRON.HISTORY, { params: { page, limit } });
      return response?.data || { runs: [], pagination: null };
    } catch (err) {
      console.error("err from cronService getCronHistory", err.message);
      throw err;
    }
  },

  getActiveLoansUsers: async () => {
    try {
      const response = await apiClient.get(endpoints.CRON.LOANS_USERS);
      return response?.users || [];
    } catch (err) {
      console.error("err from cronService getActiveLoansUsers", err.message);
      throw err;
    }
  },

  getSettings: async () => {
    try {
      const response = await apiClient.get(endpoints.SETTINGS.GET);
      return response?.settings || {};
    } catch (err) {
      console.error("err from cronService getSettings", err.message);
      throw err;
    }
  },
};
