import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const loanService = {
  getPendingLoans: async () => {
    try {
      const response = await apiClient.get(endpoints.LOANS.ADMIN);
      return response?.data?.loans || [];
    } catch (err) {
      console.log("err from loanService getPendingLoans ", err.message);
      throw err;
    }
  },

  approveLoan: async (uid) => {
    try {
      const response = await apiClient.post(`${endpoints.LOANS.ADMIN}/${uid}/approve`);
      return response;
    } catch (err) {
      console.log("err from loanService approveLoan ", err.message);
      throw err;
    }
  }
};
