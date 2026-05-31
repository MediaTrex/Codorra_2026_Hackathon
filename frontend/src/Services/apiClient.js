import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("cg_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err?.response?.data;
    const detail = data?.detail || data?.message || err.message || "Request failed";
    const status = err?.response?.status;
    const e = new Error(detail);
    e.status = status;
    e.data = data;
    throw e;
  }
);

export default apiClient;