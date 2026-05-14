import AsyncStorage from '@react-native-async-storage/async-storage';

export const tokenStorage = {
  getToken: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('📦 Token retrieved:', token ? 'Yes' : 'No');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  
  setToken: async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },
  
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userName');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
  
  getUserData: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');
      const username = await AsyncStorage.getItem('userName');
      return { token, role, username };
    } catch (error) {
      return { token: null, role: null, username: null };
    }
  },
};