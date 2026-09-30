  import axios from 'axios';

  const api = axios.create({
    // URL base com a rota do seu Controller no Spring Boot
    baseURL: 'http://172.20.10.2:8080/api/usuarios', 
    // Aumentamos o timeout para 60 segundos para dar tempo do e-mail ser enviado no Java
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  export default api;