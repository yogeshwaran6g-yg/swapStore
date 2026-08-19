import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const userService = {
  getAllUsers: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const response = await apiClient.get(endpoints.USERS.ADMIN, { params: { page, limit } });
      return response?.data || { users: [], pagination: null };
    } catch (err) {
      console.log("err from userService getAllUsers ", err.message);
      throw err;
    }
  },

  toggleBlockUser: async ({ uid, is_blocked }) => {
    try {
      const response = await apiClient.post(`${endpoints.USERS.ADMIN}/${uid}/block`, { is_blocked });
      return response;
    } catch (err) {
      console.log("err from userService toggleBlockUser ", err.message);
      throw err;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await apiClient.get(endpoints.DASHBOARD.STATS);
      return response?.data?.stats || null;
    } catch (err) {
      console.log("err from userService getDashboardStats ", err.message);
      throw err;
    }
  }
};
