
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: User and UserRole should be imported from types.ts, not AppContext.tsx which doesn't export them.
import { AppContext, AIConfig } from './contexts/AppContext';
import { User, UserRole } from './types';
import { initializeMockData } from './services/storageService';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import { Toaster, toast } from 'react-hot-toast';
import { AIService } from './services/aiService';
import { Bot } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    mode: 'MOCK',
    endpoint: 'https://your-ai-api.com/v1',
    timeout: 30000,
    retryAttempts: 3,
  });
  const [isLoading, setIsLoading] = useState(true);

  const initApp = useCallback(async () => {
    try {
      await initializeMockData();
      // Check for a logged-in user session
      const storedUser = await window.storage.get('session:user');
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      toast.error("Application failed to initialize.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    initApp();
  }, [initApp]);

  const login = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    try {
      const mockUsers = await window.storage.get('users:list');
      const userToLogin = mockUsers.find((u: User) => u.role === role);
      if (userToLogin) {
        await window.storage.set('session:user', userToLogin, true);
        setUser(userToLogin);
        toast.success(`Logged in as ${role}`);
      } else {
        throw new Error("Mock user for this role not found!");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await window.storage.set('session:user', null, true);
    setUser(null);
    toast.success("Logged out successfully.");
  }, []);

  const appContextValue = useMemo(() => ({
    user,
    login,
    logout,
    aiConfig,
    setAiConfig,
    AIService: AIService(aiConfig),
  }), [user, login, logout, aiConfig]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative">
            <Bot className="mx-auto h-20 w-20 text-green-400 animate-pulse" />
            <div className="absolute inset-0 mx-auto h-20 w-20 border-4 border-green-400/30 rounded-full animate-ping"></div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-200">Initializing ONE Platform...</p>
          <p className="mt-2 text-sm text-gray-400">Connecting to services...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{
        style: {
          background: '#1F2937',
          color: '#F9FAFB',
        },
      }}/>
      {user ? <Dashboard /> : <LoginScreen />}
    </AppContext.Provider>
  );
};

export default App;