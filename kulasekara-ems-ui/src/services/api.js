import axios from "axios";

// Creates an axios instance with a base URL set from environment variables or a default local address
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api",
});

// Intercepts every outgoing request to attach the JWT token from localStorage to the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
