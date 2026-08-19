import { apiClient } from '../utils/axios';

const endpoints = {
  SETTINGS: '/api/v1/admin/settings',
};

export const getSettings = async () => {
  try {
    const response = await apiClient.get(endpoints.SETTINGS);
    return response.data?.settings || {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await apiClient.put(endpoints.SETTINGS, { settings });
    return response;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
