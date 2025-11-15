export interface RewardRedemption {
  redemptionId: string;
  userId: string;
  type: 'transport' | 'commodity' | 'partner';
  creditsSpent: number;
  rewardDetails: {
    partnerId: string;
    rewardCode?: string;
    description: string;
    expiresAt?: Date;
  };
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  completedAt?: Date;
}

export interface Reward {
  rewardId: string;
  type: 'transport' | 'commodity' | 'partner';
  partnerId: string;
  description: string;
  creditsRequired: number;
  partnersData: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface RedeemRewardRequest {
  rewardId: string;
}
