import axios from 'axios';

// Configuração da conexão entre o Expo e o backend Spring Boot
const api = axios.create({
  baseURL: 'http://192.168.18.91:8080/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;