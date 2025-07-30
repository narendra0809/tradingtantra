import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
});

export const googleAuth = (code) =>
  api.get(`/auth/google?code=${code}`, { withCredentials: true });
