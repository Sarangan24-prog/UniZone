import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !['/login', '/register'].includes(window.location.pathname)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return new Promise(() => {});
    }

    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error' || !error.response) {
      const baseURL = API_URL.replace('/api', '');
      error.response = {
        status: 0,
        data: { message: `Cannot connect to server. Please make sure the backend is running on ${baseURL}` }
      };
    }
    return Promise.reject(error);
  }
);

export default api;
