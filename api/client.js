import axios from "axios";
import { getAuthToken } from "../lib/auth-storage";
import { triggerAuthInvalid } from "../lib/auth-invalid";

const API_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://tv.myuze.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // Don't clear tokens here — let AuthContext decide what to do.
      // The API key should never be cleared, and user token clearing
      // needs to consider whether this was a user-token auth failure
      // or just an API-key-only request that failed.
      triggerAuthInvalid();
    }
    return Promise.reject(err);
  }
);

export default api;

