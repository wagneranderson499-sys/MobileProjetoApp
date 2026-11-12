
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://financecontrol-5bg3.onrender.com/api/usuarios',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
