import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",   // FastAPI backend URL
  timeout: 10000,
});

// Add auth header automatically for future real login
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.id) {
    config.headers["X-USER-ID"] = user.id;
    config.headers["X-USER-ROLE"] = user.role;
  }
  return config;
});

export default api;
