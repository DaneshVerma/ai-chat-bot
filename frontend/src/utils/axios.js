import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;

// In production, you would set the base URL from environment variables
// axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

export default axios;
