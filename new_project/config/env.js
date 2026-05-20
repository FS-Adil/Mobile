// config/env.js
const environments = {
  development: {
    API_URL: 'http://localhost:8181/api', // ваш реальный IP
    ENV_NAME: 'development',
  },
  production: {
    API_URL: 'https://mobile.backend.finkrovl.ru/api',
    ENV_NAME: 'production',
  },
};

// Переключение окружения здесь
const currentEnv = 'production'; // меняйте на 'staging' или 'production'

export const config = environments[currentEnv];ш