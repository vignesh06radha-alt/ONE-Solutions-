
// FIX: Added import for React to use React.ElementType
import React from 'react';

export enum UserRole {
  Citizen = 'Citizen',
  Company = 'Company',
  Contractor = 'Contractor',
  Admin = 'Admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits?: number;
  domains?: string[];
  aiPerformanceScore?: number;
  avatar: string;
}

export enum ProblemStatus {
  Pending = 'Pending AI Analysis',
  Classified = 'Classified',
  Assigned = 'Assigned',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface AIAnalysis {
  category: string;
  subcategory: string;
  severity: number;
  confidence: number;
  reasoning: string;
  estimatedImpact: string;
  urgency: string;
  suggestedContractors: string[];
  creditsAllocated: number;
}

export interface Problem {
  id: string;
  userId: string;
  reporterName: string;
  description: string;
  location: { lat: number; lng: number };
  image: string; // base64 string
  status: ProblemStatus;
  timestamp: string;
  aiAnalysis?: AIAnalysis;
  aiProcessingStatus: 'pending' | 'processing' | 'complete' | 'failed';
}

export interface Bid {
  id: string;
  problemId: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  timeline: string;
  proposal: string;
  timestamp: string;
  aiScore?: number;
  aiRanking?: number;
  aiReasoning?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: React.ElementType;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  creditsPurchased: number;
  packageName: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface AISystemStatus {
  online: boolean;
  queueSize: number;
  avgResponseTime: number; // in ms
  lastUpdate: string;
}


// Define custom window.storage API for TypeScript
declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<any>;
      set: (key: string, value: any, personal: boolean) => Promise<void>;
    };
  }
}
