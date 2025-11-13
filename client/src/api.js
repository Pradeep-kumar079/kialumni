import axios from "axios";

const backendUrl = "https://kialumni.vercel.app";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

export default api;