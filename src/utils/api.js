import axios from "axios";

const api = axios.create({
  baseURL: "https://db.store1920.com/wp-json",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "wordpress_session") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
