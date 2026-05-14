import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { tokenStorage } from '../storage/tokenStorage';

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
export const registerg = async (login, password, role) => {
  try {
    // Получаем токен с await
    const token = await tokenStorage.getToken();
    
    // Проверяем наличие токена
    if (!token) {
      throw new Error('Не авторизован. Выполните вход сначала.');
    }
    
    const response = await api.post('/admin/register_new', {
      login,
      password,
      role: role || 'USER',
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("✅ Registration successful:", response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Register error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Ошибка регистрации');
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
  tokenStorage.removeToken();
};

export default api;