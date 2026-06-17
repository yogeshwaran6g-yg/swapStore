import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        const originalUrl = error.config?.url;

        if (status === 401 && originalUrl !== "/api/v1/admin/login") {
            localStorage.removeItem("admin_token");
            window.location.href = "/login";
        }

        return Promise.reject(
            error.response?.data || {
                message: "Something went wrong",
            }
        );
    }
);

export const apiClient = {
  get: (url, config = {}) =>
    axiosInstance.get(url, config),

  post: (url, data = {}, config = {}) =>
    axiosInstance.post(url, data, config),

  put: (url, data = {}, config = {}) =>
    axiosInstance.put(url, data, config),

  patch: (url, data = {}, config = {}) =>
    axiosInstance.patch(url, data, config),

  delete: (url, config = {}) =>
    axiosInstance.delete(url, config),
};