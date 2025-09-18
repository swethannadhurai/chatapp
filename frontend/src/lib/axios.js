import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chatapp-6dex.onrender.com/api",
  withCredentials: true,
});
