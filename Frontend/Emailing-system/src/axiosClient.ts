import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_FLASK_API_URL, // Change this to your backend API base URL
  // You can add more default settings here (e.g., withCredentials, timeout, etc.)
});

export default axiosClient;
