import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://mygrocery-bcw8.onrender.com';

const api = axios.create({
    baseURL: API_URL,
});

export default api;
