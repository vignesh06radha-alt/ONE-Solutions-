import { environment } from '../config/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const levelMap: { [key: string]: LogLevel } = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

const currentLevel = levelMap[environment.LOG_LEVEL.toLowerCase()] || LogLevel.INFO;

export const logger = {
  debug: (message: string, data?: any) => {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  info: (message: string, data?: any) => {
    if (currentLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },
};

export default logger;
