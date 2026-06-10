import apiClient from '@/utils/axios';
import { endpoints } from '@/config/constants';


export const getProfile = async () => {
  const response = await apiClient.get(endpoints.AUTH.profile);
  return response;
};


export const submitSwapForm = async (data) => {  const response = await apiClient.post(endpoints.SWAP.submit, data);
  return response;
};
