import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const kycService = {
  getPendingKyc: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const response = await apiClient.get(endpoints.KYC.ADMIN, { params: { page, limit } });
      return response?.data || { documents: [], pagination: null };
    } catch (err) {
      console.log("err from kycService getPendingKyc ", err.message);
      throw err;
    }
  },

  approveKyc: async ({ id, status }) => {
    try {
      const response = await apiClient.post(`${endpoints.KYC.ADMIN}/${id}/approve`, { status });
      return response;
    } catch (err) {
      console.log("err from kycService approveKyc ", err.message);
      throw err;
    }
  }
};
