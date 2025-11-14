
import { User, UserRole, Problem, ProblemStatus, Reward, Bid, AISystemStatus } from './types';
import { Briefcase, Heart, Train, Leaf, HardHat, Building } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const MOCK_USERS: User[] = [
  { id: 'user-citizen-1', name: 'Alex Ray', email: 'alex@example.com', role: UserRole.Citizen, credits: 150, avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'user-company-1', name: 'EcoCorp', email: 'contact@ecocorp.com', role: UserRole.Company, avatar: 'https://i.pravatar.cc/150?u=ecocorp' },
  { id: 'user-contractor-1', name: 'FixIt All', email: 'info@fixit.com', role: UserRole.Contractor, domains: ['Infrastructure', 'Electrical'], aiPerformanceScore: 92, avatar: 'https://i.pravatar.cc/150?u=fixit' },
  { id: 'user-admin-1', name: 'Admin', email: 'admin@one.com', role: UserRole.Admin, avatar: 'https://i.pravatar.cc/150?u=admin' },
  { id: 'user-contractor-2', name: 'GreenScapes', email: 'contact@greenscapes.com', role: UserRole.Contractor, domains: ['Green/Ecological', 'Waste Management'], aiPerformanceScore: 95, avatar: 'https://i.pravatar.cc/150?u=green' },
];

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: uuidv4(),
    userId: 'user-citizen-1',
    reporterName: 'Alex Ray',
    description: 'Large pile of trash and construction debris dumped near the river bank in sector 5. It has been there for over a week and smells awful.',
    location: { lat: 34.0522, lng: -118.2437 },
    image: 'https://picsum.photos/seed/waste1/400/300',
    status: ProblemStatus.Classified,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Green/Ecological',
      subcategory: 'Illegal Dumping',
      severity: 8.5,
      confidence: 0.98,
      reasoning: 'High-volume waste in an ecologically sensitive area poses a significant environmental risk.',
      estimatedImpact: 'High',
      urgency: 'High',
      suggestedContractors: ['user-contractor-2'],
      creditsAllocated: 85,
    },
  },
  {
    id: uuidv4(),
    userId: 'user-citizen-1',
    reporterName: 'Alex Ray',
    description: 'Deep pothole on the main street, causing traffic issues and potential vehicle damage.',
    location: { lat: 34.055, lng: -118.25 },
    image: 'https://picsum.photos/seed/pothole1/400/300',
    status: ProblemStatus.Assigned,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Infrastructure',
      subcategory: 'Road Damage',
      severity: 6.8,
      confidence: 0.95,
      reasoning: 'Pothole identified on a major traffic route, posing a moderate safety hazard.',
      estimatedImpact: 'Medium',
      urgency: 'Medium',
      suggestedContractors: ['user-contractor-1'],
      creditsAllocated: 68,
    },
  },
    {
    id: uuidv4(),
    userId: 'user-citizen-1',
    reporterName: 'Alex Ray',
    description: 'Streetlight is out at the intersection of Maple and Oak. It is very dark and unsafe at night.',
    location: { lat: 34.06, lng: -118.24 },
    image: 'https://picsum.photos/seed/lightout1/400/300',
    status: ProblemStatus.InProgress,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Infrastructure',
      subcategory: 'Electrical',
      severity: 7.2,
      confidence: 0.99,
      reasoning: 'Safety-critical infrastructure failure at a public intersection.',
      estimatedImpact: 'Medium',
      urgency: 'High',
      suggestedContractors: ['user-contractor-1'],
      creditsAllocated: 72,
    },
  },
    {
    id: uuidv4(),
    userId: 'user-citizen-1',
    reporterName: 'Alex Ray',
    description: 'Overflowing public trash can at the central park entrance.',
    location: { lat: 34.048, lng: -118.245 },
    image: 'https://picsum.photos/seed/trashcan1/400/300',
    status: ProblemStatus.Completed,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Green/Ecological',
      subcategory: 'Waste Management',
      severity: 4.5,
      confidence: 0.97,
      reasoning: 'Minor sanitation issue in a public space. Low environmental impact but affects public experience.',
      estimatedImpact: 'Low',
      urgency: 'Low',
      suggestedContractors: [],
      creditsAllocated: 45,
    },
  },
  {
    id: uuidv4(),
    userId: 'user-citizen-1',
    reporterName: 'Alex Ray',
    description: 'Broken swing at the playground. A child could get hurt.',
    location: { lat: 34.058, lng: -118.239 },
    image: 'https://picsum.photos/seed/swing1/400/300',
    status: ProblemStatus.Pending,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'pending',
  },
];

export const MOCK_BIDS: Bid[] = [
    {
        id: uuidv4(),
        problemId: MOCK_PROBLEMS[1].id,
        contractorId: 'user-contractor-1',
        contractorName: 'FixIt All',
        amount: 850,
        timeline: '2 days',
        proposal: 'We can patch the pothole using high-grade asphalt. Includes a 1-year warranty.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        aiScore: 91,
        aiRanking: 1,
        aiReasoning: 'Top-ranked bid due to competitive pricing and a strong contractor performance score.'
    }
];

export const MOCK_REWARDS: Reward[] = [
  { id: 'reward-1', title: 'Free Public Transport Pass', description: 'One week of unlimited travel on city buses and trains.', cost: 100, icon: Train },
  { id: 'reward-2', title: 'Local Cafe Voucher', description: '$10 voucher for any participating local coffee shop.', cost: 50, icon: Heart },
  { id: 'reward-3', title: 'City Gym Day Pass', description: 'One free day pass to any public recreational facility.', cost: 75, icon: Briefcase },
];

export const MOCK_CREDIT_PACKAGES = [
  { name: 'Starter', price: 100, credits: 1000, description: 'Fund small local cleanups.', popular: false, rate: 0.10 },
  { name: 'Business', price: 1000, credits: 10000, description: 'Support medium-sized projects.', popular: true, rate: 0.10 },
  { name: 'Enterprise', price: 5000, credits: 50000, description: 'Enable large-scale ecological restoration.', popular: false, rate: 0.10 },
];

export const MOCK_AI_STATUS: AISystemStatus = {
  online: true,
  queueSize: 3,
  avgResponseTime: 3450,
  lastUpdate: new Date().toISOString(),
};

export const USER_ROLE_ICONS = {
  [UserRole.Citizen]: Leaf,
  [UserRole.Contractor]: HardHat,
  [UserRole.Company]: Building,
};