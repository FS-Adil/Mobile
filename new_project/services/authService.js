import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Авторизация пользователя
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      
      const { token, role, username: userName } = response.data;
      
      // Сохраняем данные в localStorage
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_role', role);
      await AsyncStorage.setItem('username', userName);
      
      return {
        success: true,
        role,
        username: userName,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка авторизации',
      };
    }
  }
  
  // Регистрация нового пользователя (только для админа)
  async register(username, password, role, adminToken) {
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
      
      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка регистрации',
      };
    }
  }
  
  // Выход из системы
  async logout() {
    await AsyncStorage.multiRemove(['auth_token', 'user_role', 'username']);
  }
  
  // Получение текущего пользователя
  async getCurrentUser() {
    const token = await AsyncStorage.getItem('auth_token');
    const role = await AsyncStorage.getItem('user_role');
    const username = await AsyncStorage.getItem('username');
    
    if (!token) return null;
    
    return {
      token,
      role,
      username,
      isAuthenticated: true,
      isAdmin: role === 'ADMIN',
    };
  }
  
  // Проверка авторизации
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  }
  
  // Получение роли пользователя
  async getUserRole() {
    return await AsyncStorage.getItem('user_role');
  }
}

export default new AuthService();