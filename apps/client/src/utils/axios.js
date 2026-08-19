// src/utils/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    return Promise.reject({
      status,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong',
      errors: error?.response?.data?.errors || {},
      data: error?.response?.data || null,
    });
  }
);

/**
 * API Methods
 */
const apiClient = {
  get: async (url, params = {}, config = {}) => {
    return api.get(url, {
      params,
      ...config,
    });
  },

  post: async (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  put: async (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  patch: async (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },

  delete: async (url, config = {}) => {
    return api.delete(url, config);
  },

  upload: async (url, formData, config = {}) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },

  download: async (url, config = {}) => {
    return api.get(url, {
      responseType: 'blob',
      ...config,
    });
  },
};

export default apiClient;