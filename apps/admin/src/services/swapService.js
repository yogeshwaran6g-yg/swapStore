import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const swapService = {
  getAllSwaps: async () => {
    try {
      const response = await apiClient.get(endpoints.SWAPS.ADMIN);
      return response?.data?.swaps || [];
    } catch (err) {
      console.log("err from swapService getAllSwaps ", err.message);
      throw err;
    }
  },

  updateSwapStatus: async ({ orderId, status }) => {
    try {
      const response = await apiClient.post(`${endpoints.SWAPS.ADMIN}/${orderId}/status`, { status });
      return response;
    } catch (err) {
      console.log("err from swapService updateSwapStatus ", err.message);
      throw err;
    }
  }
};
