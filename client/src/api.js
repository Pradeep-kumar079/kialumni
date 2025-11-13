import axios from "axios";

const backendUrl = "http://localhost:5000";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

export default api;