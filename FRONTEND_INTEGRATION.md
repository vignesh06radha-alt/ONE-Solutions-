# Frontend Integration Guide

This document explains how to integrate your existing React frontend with the ONE backend API.

## Backend URL Configuration

### Development Environment
```typescript
// src/config/api.ts (or services/apiClient.ts)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

Add to `.env`:
```
REACT_APP_API_URL=http://localhost:3001/api
```

### Production Environment
Update for your production API:
```
REACT_APP_API_URL=https://api.oneplatform.com/api
```

## API Client Setup

### Simple Fetch-Based Client
```typescript
// src/services/apiClient.ts
export const apiClient = {
  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};
```

## Common Use Cases

### 1. User Registration

```typescript
async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: 'public' | 'company' | 'contractor'
) {
  try {
    const { data } = await apiClient.post('/auth/register', {
      email,
      password,
      displayName,
      role,
    });

    const { token, user } = data;
    
    // Store token
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

### 2. User Login

```typescript
async function loginUser(email: string, password: string) {
  try {
    const { data } = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const { token, user } = data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### 3. Report a Problem

```typescript
async function reportProblem(
  description: string,
  location: { lat: number; lng: number; address?: string },
  photoUrl?: string
) {
  try {
    const { data } = await apiClient.post('/problems', {
      description,
      location,
      photoUrl,
    });

    const { problem } = data;
    console.log(`Problem reported! Earned ${problem.oneCreditsAllocated} credits`);
    
    return problem;
  } catch (error) {
    console.error('Failed to report problem:', error);
    throw error;
  }
}
```

### 4. Get User's Problems

```typescript
async function getUserProblems() {
  try {
    const { data } = await apiClient.get('/problems/mine');
    return data.problems;
  } catch (error) {
    console.error('Failed to fetch problems:', error);
    throw error;
  }
}
```

### 5. Submit a Bid (Contractor)

```typescript
async function submitBid(
  problemId: string,
  quoteAmount: number,
  notes: string
) {
  try {
    const { data } = await apiClient.post('/bids', {
      problemId,
      quoteAmount,
      notes,
    });

    console.log('Bid submitted successfully');
    return data.bid;
  } catch (error) {
    console.error('Failed to submit bid:', error);
    throw error;
  }
}
```

### 6. Register as Contractor

```typescript
async function registerContractor(
  domain: string,
  serviceAreas: string[]
) {
  try {
    const { data } = await apiClient.post('/contractors/register', {
      domain,
      serviceAreas,
    });

    return data.contractor;
  } catch (error) {
    console.error('Failed to register as contractor:', error);
    throw error;
  }
}
```

### 7. Purchase Green Credits (Company)

```typescript
async function purchaseGreenCredits(
  amountPurchased: number,
  unitPrice: number
) {
  try {
    const { data } = await apiClient.post('/green-credits/purchase', {
      amountPurchased,
      unitPrice,
    });

    return data.purchase;
  } catch (error) {
    console.error('Failed to purchase credits:', error);
    throw error;
  }
}
```

### 8. Get Green Credit Balance (Company)

```typescript
async function getGreenCreditBalance() {
  try {
    const { data } = await apiClient.get('/green-credits/balance');
    return data.balance;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
}
```

### 9. Redeem Reward

```typescript
async function redeemReward(rewardId: string) {
  try {
    const { data } = await apiClient.post('/rewards/redeem', {
      rewardId,
    });

    const { redemption } = data;
    console.log(`Reward redeemed! Code: ${redemption.rewardDetails.rewardCode}`);
    
    return redemption;
  } catch (error) {
    console.error('Failed to redeem reward:', error);
    throw error;
  }
}
```

### 10. Get Heatmap Data

```typescript
async function getHeatmapData(bounds?: {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
}) {
  try {
    let url = '/heatmap';
    
    if (bounds) {
      url += `?neLat=${bounds.ne.lat}&neLng=${bounds.ne.lng}`;
      url += `&swLat=${bounds.sw.lat}&swLng=${bounds.sw.lng}`;
    }

    const { data } = await apiClient.get(url);
    return data.heatmapData;
  } catch (error) {
    console.error('Failed to fetch heatmap:', error);
    throw error;
  }
}
```

### 11. Get Available Rewards

```typescript
async function getAvailableRewards() {
  try {
    const { data } = await apiClient.get('/rewards/list');
    return data.rewards;
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
    throw error;
  }
}
```

### 12. Get Redemption History

```typescript
async function getRedemptionHistory() {
  try {
    const { data } = await apiClient.get('/rewards/history');
    return data.history;
  } catch (error) {
    console.error('Failed to fetch redemption history:', error);
    throw error;
  }
}
```

## Context/State Management Integration

### React Context Example

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  userId: string;
  email: string;
  role: string;
  oneCreditsBalance: number;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const { user: newUser, token: newToken } = data;
    
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('auth_token', newToken);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string, role: string) => {
      const { data } = await apiClient.post('/auth/register', {
        email,
        password,
        displayName,
        role,
      });
      
      const { user: newUser, token: newToken } = data;
      
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', newToken);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

## Error Handling

```typescript
// src/utils/errorHandler.ts
export function handleApiError(error: Error): string {
  if (error.message === 'Unauthorized') {
    return 'Please log in again';
  }
  if (error.message === 'Forbidden') {
    return 'You do not have permission for this action';
  }
  if (error.message.includes('Insufficient credits')) {
    return 'Not enough credits for this action';
  }
  return error.message || 'An error occurred. Please try again.';
}
```

## Photo Upload

```typescript
async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}/upload-photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload photo');
  }

  const { photoUrl } = await response.json();
  return photoUrl;
}
```

## Polling for Status Updates

```typescript
async function pollProblemStatus(problemId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await apiClient.get(`/problems/${problemId}`);
    const { problem } = data;

    if (problem.status === 'bidding' || problem.status === 'completed') {
      return problem;
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Problem classification timed out');
}
```

## Environment Configuration

### .env.local
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_LOG_LEVEL=debug
```

### CORS Configuration

The backend is configured with CORS. Make sure your frontend URL matches the `CORS_ORIGIN` in backend `.env`:
```
CORS_ORIGIN=http://localhost:3000
```

## Testing Integration

Use Postman or curl to test endpoints before integrating with frontend:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","displayName":"Test","role":"public"}'

# Get token from response, then use it:
TOKEN="your_jwt_token"

# Create problem
curl -X POST http://localhost:3001/api/problems \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test issue","location":{"lat":28.7041,"lng":77.1025}}'
```

## Production Deployment

1. Update API URL to production backend
2. Use environment-based configuration
3. Ensure CORS is set to your frontend domain
4. Use HTTPS for all API calls
5. Implement token refresh on 401 responses
6. Add request timeout handling
7. Implement proper error logging

