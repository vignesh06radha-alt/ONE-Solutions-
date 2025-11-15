import { config } from 'dotenv';

config();

export const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
  N8N_API_KEY: process.env.N8N_API_KEY || '',
  N8N_TIMEOUT: parseInt(process.env.N8N_TIMEOUT || '30000', 10),
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

export default environment;
