import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { config } from '../config/env';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена в заголовки
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Авторизация
export const loging = async (login, password) => {

  try {
    const response = await api.post('/auth/login', {
      login,
      password,
    });
    
    if (response.data.token) {
      // Сохраняем токен и данные пользователя
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userRole', response.data.role);
      await AsyncStorage.setItem('userName', response.data.login);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Ошибка авторизации');
  }
};

// Регистрация нового пользователя (только для админа)
export const register = async (username, password, role, adminToken) => {
  try {
    const response = await api.post('/admin/register', {
      username,
      password,
      role: role || 'USER',
    }, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw new Error(error.response?.data || 'Ошибка регистрации');
  }
};

// Получение списка товаров
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Get products error:', error.response?.data || error.message);
    throw new Error(error.response?.data || 'Ошибка получения товаров');
  }
};

// Проверка роли пользователя
export const getUserRole = async () => {
  const role = await AsyncStorage.getItem('userRole');
  return role;
};

// Выход из системы
export const logoutg = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userRole');
  await AsyncStorage.removeItem('userName');
};

export default api;