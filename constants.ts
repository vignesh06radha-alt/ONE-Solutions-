
import { User, UserRole, Problem, ProblemStatus, Reward, Bid, AISystemStatus } from './types';
import { Briefcase, Heart, Train, Leaf, HardHat, Building } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const MOCK_USERS: User[] = [
  { id: 'user-citizen-1', name: 'Alex Ray', email: 'alex@example.com', role: UserRole.Citizen, credits: 250, avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'user-citizen-2', name: 'Sarah Chen', email: 'sarah@example.com', role: UserRole.Citizen, credits: 180, avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'user-citizen-3', name: 'Mike Johnson', email: 'mike@example.com', role: UserRole.Citizen, credits: 320, avatar: 'https://i.pravatar.cc/150?u=mike' },
  { id: 'user-company-1', name: 'EcoCorp', email: 'contact@ecocorp.com', role: UserRole.Company, avatar: 'https://i.pravatar.cc/150?u=ecocorp' },
  { id: 'user-company-2', name: 'GreenTech Solutions', email: 'info@greentech.com', role: UserRole.Company, avatar: 'https://i.pravatar.cc/150?u=greentech' },
  { id: 'user-contractor-1', name: 'FixIt All', email: 'info@fixit.com', role: UserRole.Contractor, domains: ['Infrastructure', 'Electrical'], aiPerformanceScore: 92, avatar: 'https://i.pravatar.cc/150?u=fixit' },
  { id: 'user-contractor-2', name: 'GreenScapes', email: 'contact@greenscapes.com', role: UserRole.Contractor, domains: ['Green/Ecological', 'Waste Management'], aiPerformanceScore: 95, avatar: 'https://i.pravatar.cc/150?u=green' },
  { id: 'user-contractor-3', name: 'Urban Fixers', email: 'hello@urbanfixers.com', role: UserRole.Contractor, domains: ['Infrastructure', 'Road Maintenance'], aiPerformanceScore: 88, avatar: 'https://i.pravatar.cc/150?u=urban' },
  { id: 'user-admin-1', name: 'Admin', email: 'admin@one.com', role: UserRole.Admin, avatar: 'https://i.pravatar.cc/150?u=admin' },
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
    userId: 'user-citizen-2',
    reporterName: 'Sarah Chen',
    description: 'Broken water pipe leaking on Elm Street. Water is flooding the sidewalk and creating a hazard.',
    location: { lat: 34.062, lng: -118.248 },
    image: 'https://picsum.photos/seed/water1/400/300',
    status: ProblemStatus.Classified,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Infrastructure',
      subcategory: 'Water System',
      severity: 7.8,
      confidence: 0.96,
      reasoning: 'Water leak causing property damage and safety hazard. Requires immediate attention.',
      estimatedImpact: 'High',
      urgency: 'High',
      suggestedContractors: ['user-contractor-1'],
      creditsAllocated: 78,
    },
  },
  {
    id: uuidv4(),
    userId: 'user-citizen-2',
    reporterName: 'Sarah Chen',
    description: 'Graffiti covering the community center wall. Multiple inappropriate tags visible.',
    location: { lat: 34.051, lng: -118.242 },
    image: 'https://picsum.photos/seed/graffiti1/400/300',
    status: ProblemStatus.Bidding,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Other',
      subcategory: 'Vandalism',
      severity: 5.2,
      confidence: 0.94,
      reasoning: 'Vandalism affecting public property. Moderate priority for community aesthetics.',
      estimatedImpact: 'Medium',
      urgency: 'Medium',
      suggestedContractors: ['user-contractor-3'],
      creditsAllocated: 52,
    },
  },
  {
    id: uuidv4(),
    userId: 'user-citizen-3',
    reporterName: 'Mike Johnson',
    description: 'Dead tree branches hanging over the road. Could fall and cause damage during storms.',
    location: { lat: 34.059, lng: -118.251 },
    image: 'https://picsum.photos/seed/tree1/400/300',
    status: ProblemStatus.Classified,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Green/Ecological',
      subcategory: 'Tree Maintenance',
      severity: 6.5,
      confidence: 0.93,
      reasoning: 'Hazardous tree condition poses safety risk. Requires professional tree service.',
      estimatedImpact: 'Medium',
      urgency: 'Medium',
      suggestedContractors: ['user-contractor-2'],
      creditsAllocated: 65,
    },
  },
  {
    id: uuidv4(),
    userId: 'user-citizen-3',
    reporterName: 'Mike Johnson',
    description: 'Broken swing at the playground. A child could get hurt.',
    location: { lat: 34.058, lng: -118.239 },
    image: 'https://picsum.photos/seed/swing1/400/300',
    status: ProblemStatus.Pending,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'pending',
  },
  {
    id: uuidv4(),
    userId: 'user-citizen-1',
    reporterName: 'Alex Ray',
    description: 'Sewer drain blocked with leaves and debris. Water pooling on street during rain.',
    location: { lat: 34.053, lng: -118.246 },
    image: 'https://picsum.photos/seed/drain1/400/300',
    status: ProblemStatus.Completed,
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    aiProcessingStatus: 'complete',
    aiAnalysis: {
      category: 'Infrastructure',
      subcategory: 'Drainage',
      severity: 6.0,
      confidence: 0.95,
      reasoning: 'Blocked drainage causing water accumulation. Moderate priority for flood prevention.',
      estimatedImpact: 'Medium',
      urgency: 'Medium',
      suggestedContractors: ['user-contractor-1'],
      creditsAllocated: 60,
    },
  },
];

// MOCK_BIDS will be initialized after MOCK_PROBLEMS to avoid reference issues
export const getMockBids = (): Bid[] => {
    const problems = MOCK_PROBLEMS;
    return [
        {
            id: uuidv4(),
            problemId: problems[1]?.id || uuidv4(),
            contractorId: 'user-contractor-1',
            contractorName: 'FixIt All',
            amount: 850,
            timeline: '2 days',
            proposal: 'We can patch the pothole using high-grade asphalt. Includes a 1-year warranty.',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            aiScore: 91,
            aiRanking: 1,
            aiReasoning: 'Top-ranked bid due to competitive pricing and a strong contractor performance score.'
        },
        {
            id: uuidv4(),
            problemId: problems[1]?.id || uuidv4(),
            contractorId: 'user-contractor-3',
            contractorName: 'Urban Fixers',
            amount: 920,
            timeline: '3 days',
            proposal: 'Complete road repair with premium materials. 18-month warranty included.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            aiScore: 85,
            aiRanking: 2,
            aiReasoning: 'Good quality proposal but slightly higher cost compared to top bid.'
        },
        {
            id: uuidv4(),
            problemId: problems[4]?.id || uuidv4(),
            contractorId: 'user-contractor-1',
            contractorName: 'FixIt All',
            amount: 1200,
            timeline: '1 day',
            proposal: 'Emergency water pipe repair. Available immediately. Same-day service.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            aiScore: 88,
            aiRanking: 1,
            aiReasoning: 'Fast response time and competitive pricing for urgent repair.'
        }
    ];
};

export const MOCK_BIDS: Bid[] = getMockBids();

export const MOCK_REWARDS: Reward[] = [
  // Transport Rewards
  { id: 'reward-1', title: 'Bus Ride Discount - 20% Off', description: 'Get 20% discount on your next 10 bus rides. Valid for 30 days.', cost: 50, icon: Train },
  { id: 'reward-2', title: 'Weekly Bus Pass - 50% Off', description: 'One week of unlimited travel on city buses at 50% discount.', cost: 100, icon: Train },
  { id: 'reward-3', title: 'Monthly Transport Pass', description: 'Full month of unlimited travel on buses and trains. Save up to $40.', cost: 200, icon: Train },
  { id: 'reward-4', title: 'Train Ticket - 15% Off', description: 'Discount on train tickets for your next journey. Valid for 60 days.', cost: 75, icon: Train },
  
  // Commodity Rewards
  { id: 'reward-5', title: 'Grocery Store - $10 Off', description: '$10 discount voucher at participating grocery stores. Minimum purchase $50.', cost: 80, icon: Heart },
  { id: 'reward-6', title: 'Supermarket - 10% Off', description: '10% discount on all items at partner supermarkets. Valid for one month.', cost: 120, icon: Heart },
  { id: 'reward-7', title: 'Household Essentials Pack', description: 'Discount bundle on household items including cleaning supplies and toiletries.', cost: 90, icon: Heart },
  { id: 'reward-8', title: 'Local Market - $5 Off', description: '$5 discount at local farmers market. Support local businesses!', cost: 40, icon: Heart },
  
  // Partner Offers
  { id: 'reward-9', title: 'Local Cafe Voucher', description: '$10 voucher for any participating local coffee shop. Valid for 90 days.', cost: 60, icon: Briefcase },
  { id: 'reward-10', title: 'City Gym Day Pass', description: 'One free day pass to any public recreational facility. Stay active!', cost: 70, icon: Briefcase },
  { id: 'reward-11', title: 'Restaurant - 15% Off', description: '15% discount at partner restaurants. Valid for dine-in or takeout.', cost: 85, icon: Briefcase },
  { id: 'reward-12', title: 'Movie Ticket Discount', description: 'Buy one get one free on movie tickets at partner cinemas.', cost: 95, icon: Briefcase },
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