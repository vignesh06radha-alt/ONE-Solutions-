/**
 * API Service for connecting frontend to backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthToken(): string | null {
    // Get token from localStorage or context
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, displayName: string, role: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName, role }),
    });
  }

  // Rewards methods
  async getRewards() {
    return this.request<{ rewards: any[] }>('/rewards/list');
  }

  async redeemReward(rewardId: string) {
    return this.request<{ redemption: any }>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId }),
    });
  }

  async getRedemptionHistory() {
    return this.request<{ history: any[] }>('/rewards/history');
  }

  // Problems methods
  async createProblem(problemData: {
    description: string;
    photoUrl?: string;
    location: { lat: number; lng: number; address?: string };
  }) {
    return this.request<{ problem: any }>('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async getUserProblems() {
    return this.request<{ problems: any[] }>('/problems/mine');
  }

  // User methods
  async getUserProfile() {
    // This would need a user profile endpoint
    return this.request<any>('/auth/me');
  }
}

export const apiService = new ApiService();

