import axios from 'axios';

const api = axios.create({
  // Substitua 192.168.X.X pelo IP local da sua máquina
  baseURL: 'http://192.168.18.19:8080', 
  timeout: 10000,
});

export default api;