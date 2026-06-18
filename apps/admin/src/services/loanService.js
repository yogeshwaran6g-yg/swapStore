import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const loanService = {
  getAllLoans: async () => {
    try {
      const response = await apiClient.get(endpoints.LOANS.ADMIN);
      return response?.data?.loans || [];
    } catch (err) {
      console.log("err from loanService getAllLoans ", err.message);
      throw err;
    }
  },

  approveLoan: async ({ uid, txHash, fee }) => {
    try {
      const response = await apiClient.post(`${endpoints.LOANS.ADMIN}/${uid}/approve`, {
        disbursementTxHash: txHash,
        disbursementFee: fee
      });
      return response;
    } catch (err) {
      console.log("err from loanService approveLoan ", err.message);
      throw err;
    }
  },

  rejectLoan: async (uid) => {
    try {
      const response = await apiClient.post(`${endpoints.LOANS.ADMIN}/${uid}/reject`);
      return response;
    } catch (err) {
      console.log("err from loanService rejectLoan ", err.message);
      throw err;
    }
  }
};
