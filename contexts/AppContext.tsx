
// FIX: Import React to use React.Dispatch and React.SetStateAction
import React, { createContext } from 'react';
import { User, UserRole } from '../types';
import { IaiService } from '../services/aiService';

export interface AIConfig {
  mode: 'MOCK' | 'PRODUCTION';
  endpoint: string;
  timeout: number;
  retryAttempts: number;
}

export interface IAppContext {
  user: User | null;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  aiConfig: AIConfig;
  setAiConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
  AIService: IaiService;
}

export const AppContext = createContext<IAppContext | null>(null);
