import { Auth } from "../lib/auth";

// Use environment variable when available
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Admin endpoints are mounted at /admin on the backend (not under /api)
export const ADMIN_BASE = (process.env.NEXT_PUBLIC_ADMIN_URL || BASE_URL.replace(/\/api\/?$/, "")) + "/admin";

export const getToken = () => {
  return Auth.getToken();
};

export const authHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export default BASE_URL;