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
    const message = err?.response?.data?.error || 'Unable to login using wallet';
    console.error("Wallet login failed:", message);
    toast.error(message);
    throw err;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await apiClient.put(endpoints.AUTH.profile, data);
    return response;
  } catch (err) {
    const message = err?.response?.data?.error || 'Unable to update profile';
    console.error("Profile update failed:", message);
    toast.error(message);
    throw err;
  }
};

export const updateBankDetails = async (data) => {
  try {
    const response = await apiClient.put(endpoints.AUTH.bank, data);
    return response;
  } catch (err) {
    const message = err?.response?.data?.error || 'Unable to update bank details';
    console.error("Bank details update failed:", message);
    toast.error(message);
    throw err;
  }
};
