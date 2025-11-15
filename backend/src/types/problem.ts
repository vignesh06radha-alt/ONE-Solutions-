export interface Problem {
  problemId: string;
  reportedByUserId: string;
  description: string;
  photoUrl?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  category: 'green' | 'infra' | 'other';
  severityScore: number;
  environmentalPriority: number;
  status: 'pending' | 'classifying' | 'bidding' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
  oneCreditsAllocated: number;
  n8nAnalysisMetadata?: Record<string, any>;
  estimatedBudget?: number;
  assignedContractorId?: string;
  biddingSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateProblemRequest {
  description: string;
  photoUrl?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
}
