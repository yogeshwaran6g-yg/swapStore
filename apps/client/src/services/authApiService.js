import apiClient from '@/utils/axios';
import { endpoints } from '@/config/constants';
import { toast } from "react-hot-toast";

/**
 * Login or signup by wallet address.
 * @param {string} address - The wallet address
 * @returns {Promise<{ message: string, token: string, uid: string }>}
 */

export const walletLogin = async (address) => {
  try {
    const response = await apiClient.post(endpoints.AUTH.walletLogin, { address });
    return response;
  } catch (err) {
    console.log("something went wrong, unable to login using wallet", err)
    toast.err("something went wrong, unable to login using wallet")
  }
};
