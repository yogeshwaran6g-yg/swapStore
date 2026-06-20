import { apiClient } from "../utils/axios.js";
import endpoints from "../config/constants.js";

export const loanService = {
  getAllLoans: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const response = await apiClient.get(endpoints.LOANS.ADMIN, { params: { page, limit } });
      return response?.data || { loans: [], pagination: null };
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

  updateLoanDetails: async ({ uid, interestRate, loanTermDays }) => {
    try {
      const response = await apiClient.put(`${endpoints.LOANS.ADMIN}/${uid}/details`, {
        interestRate,
        loanTermDays
      });
      return response;
    } catch (err) {
      console.log("err from loanService updateLoanDetails ", err.message);
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
