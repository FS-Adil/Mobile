import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Базовый URL вашего сервера (замените на реальный IP)
// Для эмулятора Android используйте 10.0.2.2
// Для физического устройства используйте IP вашего компьютера
const BASE_URL = 'http://192.168.1.100:8080/api'; // Замените на ваш IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена к каждому запросу
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      await AsyncStorage.multiRemove(['auth_token', 'user_role', 'username']);
      // Здесь можно вызвать событие выхода из системы
    }
    return Promise.reject(error);
  }
);

export default api;