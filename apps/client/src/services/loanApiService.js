import apiClient from '@/utils/axios';
import { endpoints } from '@/config/constants';
import { toast } from "react-hot-toast";

/**
 * Fetch Loan Eligibility Requirements
 * @returns {Promise<any>}
 */
export const getLoanEligibility = async () => {
  try {
    const response = await apiClient.get(endpoints.LOAN.eligibility);
    return response;
  } catch (err) {
    const message = err?.response?.data?.error || 'Failed to fetch loan eligibility';
    console.error("Fetch eligibility failed:", message);
    toast.error(message);
    throw err;
  }
};

/**
 * Upload KYC Document
 * @param {FormData} formData - The form data containing kycDocument and documentType
 * @returns {Promise<any>}
 */
export const uploadKycDocument = async (formData) => {
  try {
    const response = await apiClient.post(endpoints.LOAN.kyc, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (err) {
    const message = err?.response?.data?.error || 'Failed to upload KYC document';
    console.error("KYC upload failed:", message);
    toast.error(message);
    throw err;
  }
};

/**
 * Request a new Loan
 * @param {Object} payload - { principalAmount, tokenAddress, network }
 * @returns {Promise<any>}
 */
export const requestNewLoan = async (payload) => {
  try {
    const response = await apiClient.post(endpoints.LOAN.request, payload);
    return response;
  } catch (err) {
    const message = err?.response?.data?.error || 'Failed to request loan';
    console.error("Loan request failed:", message);
    toast.error(message);
    throw err;
  }
};

/**
 * Get user's loans
 * @returns {Promise<any>}
 */
export const fetchMyLoans = async () => {
  try {
    const response = await apiClient.get(endpoints.LOAN.myLoans);
    return response;
  } catch (err) {
    const message = err?.response?.data?.error || 'Failed to fetch loans';
    console.error("Fetch loans failed:", message);
    toast.error(message);
    throw err;
  }
};
