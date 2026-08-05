import axios from "axios";

const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "/api";
const baseURL = raw.replace(/\/+$/, "") || "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
