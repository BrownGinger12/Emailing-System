import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:5000", // Change this to your backend API base URL
  // You can add more default settings here (e.g., withCredentials, timeout, etc.)
});

export default axiosClient;
