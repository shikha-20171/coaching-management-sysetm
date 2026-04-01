import axios from "axios";
import { getDefaultRouteForRole } from "../utils/session";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 400) {
      const role = localStorage.getItem("role");
      if (error.response?.data === "Invalid Token" || error.response?.data === "Access Denied") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = getDefaultRouteForRole(role);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
