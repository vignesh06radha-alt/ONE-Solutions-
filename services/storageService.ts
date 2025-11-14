
import { UserRole, Problem, ProblemStatus, User, Reward, Transaction } from '../types';
import { MOCK_USERS, MOCK_PROBLEMS, MOCK_REWARDS, MOCK_CREDIT_PACKAGES, MOCK_BIDS, MOCK_AI_STATUS } from '../constants';
import { Briefcase, Heart, Train } from 'lucide-react';

// Mock window.storage if it doesn't exist
if (!window.storage) {
  console.log("Mocking window.storage API for development.");
  window.storage = {
    get: async (key: string): Promise<any> => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    set: async (key: string, value: any, personal: boolean): Promise<void> => {
      // The 'personal' flag is part of the API spec but not used in this mock.
      localStorage.setItem(key, JSON.stringify(value));
    },
  };
}

export const initializeMockData = async () => {
  try {
    const isInitialized = await window.storage.get('app:initialized');
    if (isInitialized) {
      console.log('Mock data already initialized.');
      return;
    }

    console.log('Initializing mock data...');
    
    await window.storage.set('users:list', MOCK_USERS, true);
    for (const user of MOCK_USERS) {
      await window.storage.set(`user:${user.id}`, user, false);
    }

    await window.storage.set('problems:list', MOCK_PROBLEMS.map(p => p.id), true);
    for (const problem of MOCK_PROBLEMS) {
      await window.storage.set(`problem:${problem.id}`, problem, true);
    }
    
    for (const bid of MOCK_BIDS) {
        const problemBids = await window.storage.get(`bids:${bid.problemId}`) || [];
        await window.storage.set(`bids:${bid.problemId}`, [...problemBids, bid], true);
    }
    
    const companyUser = MOCK_USERS.find(u => u.role === UserRole.Company);
    if(companyUser){
        const mockTransactions: Transaction[] = [
            { id: 'txn1', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), amount: 5000, creditsPurchased: 50000, packageName: 'Enterprise' },
            { id: 'txn2', date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), amount: 1000, creditsPurchased: 10000, packageName: 'Business' },
        ];
        await window.storage.set(`transactions:${companyUser.id}`, mockTransactions, false);
    }

    await window.storage.set('rewards:catalog', MOCK_REWARDS, true);
    await window.storage.set('ai:status', MOCK_AI_STATUS, true);

    await window.storage.set('app:initialized', true, true);
    console.log('Mock data initialization complete.');
  } catch (error) {
    console.error("Error initializing mock data:", error);
  }
};
