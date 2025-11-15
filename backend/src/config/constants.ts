export const ROLES = {
  PUBLIC: 'public',
  COMPANY: 'company',
  CONTRACTOR: 'contractor',
  ADMIN: 'admin',
} as const;

export const PROBLEM_STATUS = {
  PENDING: 'pending',
  CLASSIFYING: 'classifying',
  BIDDING: 'bidding',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const PROBLEM_CATEGORY = {
  GREEN: 'green',
  INFRA: 'infra',
  OTHER: 'other',
} as const;

export const BIDDING_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  AWARDED: 'awarded',
} as const;

export const REDEMPTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const;

export const REWARD_TYPE = {
  TRANSPORT: 'transport',
  COMMODITY: 'commodity',
  PARTNER: 'partner',
} as const;

export const COLLECTIONS = {
  USERS: 'users',
  PROBLEMS: 'problems',
  BIDDING_SESSIONS: 'biddingSessions',
  BIDS: 'bids',
  GREEN_CREDITS: 'greenCredits',
  ONE_CREDITS: 'oneCredits',
  REDEMPTIONS: 'redemptions',
  REWARDS: 'rewards',
  N8N_JOBS: 'n8nJobs',
} as const;
