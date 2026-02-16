import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://https://mygrocery-bcw8.onrender.com0';

const api = axios.create({
    baseURL: API_URL,
});

export default api;
