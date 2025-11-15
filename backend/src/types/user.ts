export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  role: 'public' | 'company' | 'contractor';
  displayName: string;
  profileImageUrl?: string;
  oneCreditsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
}

export interface PublicUserProfile extends User {
  reportCount: number;
  averageSeverityReported: number;
}

export interface CompanyProfile extends User {
  companyName: string;
  registrationNumber: string;
  greenCreditsBalance: number;
  greenCreditSpent: number;
  impactScore: number;
}

export interface ContractorProfile extends User {
  domain: string;
  trustScore: number;
  completedJobs: number;
  averageRating: number;
  serviceAreas: string[];
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
