import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const kycService = {
  getPendingKyc: async () => {
    try {
      const response = await apiClient.get(endpoints.KYC.ADMIN);
      return response?.data?.documents || [];
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
