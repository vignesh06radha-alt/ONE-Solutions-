# ONE Platform - Complete Project Structure

This repository contains both the **frontend** and **backend** for the ONE civic-tech platform that connects citizens, companies, and contractors to solve civic and environmental problems.

## Project Overview

```
ONE_Solutions/
├── Frontend/ (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── screens/        # Page components
│   │   ├── contexts/       # React context
│   │   ├── services/       # API client, storage
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── Backend/ (Express + TypeScript + Firebase)
    ├── src/
    │   ├── config/         # Configuration
    │   ├── middleware/     # Auth, RBAC, logging
    │   ├── types/          # TypeScript interfaces
    │   ├── services/       # Business logic
    │   ├── routes/         # API endpoints
    │   ├── utils/          # Helpers, validators
    │   ├── integrations/   # n8n integration
    │   ├── app.ts
    │   └── server.ts
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## The ONE Platform

The ONE platform connects three key stakeholders:

### 1. 👥 Citizens / General Public
- Report civic and environmental issues
- Describe problems with photos and location
- Earn **One Credits** for valuable reports
- Redeem credits for public transit discounts, services, partner offers
- Track impact of reported problems

### 2. 🏢 Companies & Sponsors
- Purchase **Green Credits** at subsidized rates
- Fund environmental problem solutions
- Track impact and ROI
- Dashboard showing problems funded and environmental impact

### 3. 🔧 Contractors & SMEs
- Register expertise (waste, repairs, infrastructure, solar, etc.)
- Receive bids on available problems
- AI-powered matching based on domain, cost, performance
- Track completed jobs and build reputation

### ✨ The AI Agent (n8n)
- **Problem Classification**: Categorize & score severity
- **Token Allocation**: Calculate One Credits earned
- **Bid Selection**: Choose best contractor (cost + reliability)
- **Heatmap Intelligence**: Aggregate problem clusters

## Architecture at a Glance

```
Frontend (React)
     ↓ (HTTP REST API)
     ↓
Backend (Express)
     ├─ Routes & Middleware
     ├─ Services (Business Logic)
     ├─ n8n Integration Layer
     └─ Database Adapters
            ↓              ↓
        Firestore      n8n (AI)
```

## Quick Start

### Backend Setup (5 minutes)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with Firebase credentials & n8n URL
npm run dev
# Server runs on http://localhost:3001
```

### Frontend Setup

```bash
cd .
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <JWT_TOKEN>
```

### Key Endpoints

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Auth | POST | `/auth/register` | Register new user |
| Auth | POST | `/auth/login` | Login user |
| Problems | POST | `/problems` | Report new problem |
| Problems | GET | `/problems/mine` | Get user's problems |
| Problems | GET | `/heatmap` | Get heatmap data |
| Bids | POST | `/bids` | Submit bid (contractor) |
| Credits | POST | `/green-credits/purchase` | Purchase credits (company) |
| Rewards | POST | `/rewards/redeem` | Redeem One Credits |
| Contractors | POST | `/contractors/register` | Register contractor |

**Full API docs**: See `backend/README.md`

## Frontend Integration

The frontend communicates with the backend via REST API calls.

### Configuration
```typescript
// .env
REACT_APP_API_URL=http://localhost:3001/api
```

### Example API Call
```typescript
const response = await fetch('http://localhost:3001/api/problems', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    description: 'Pothole on Main St',
    location: { lat: 28.7041, lng: 77.1025 }
  })
});
```

**Full integration guide**: See `FRONTEND_INTEGRATION.md`

## Data Models

### Users
```typescript
interface User {
  userId: string;
  email: string;
  role: 'public' | 'company' | 'contractor';
  oneCreditsBalance: number;
  displayName: string;
  createdAt: Date;
}

interface ContractorProfile extends User {
  domain: string;
  trustScore: number;
  completedJobs: number;
}

interface CompanyProfile extends User {
  greenCreditsBalance: number;
  impactScore: number;
}
```

### Problems
```typescript
interface Problem {
  problemId: string;
  reportedByUserId: string;
  description: string;
  location: { lat: number; lng: number };
  category: 'green' | 'infra' | 'other';
  severityScore: number;
  oneCreditsAllocated: number;
  status: 'pending' | 'bidding' | 'assigned' | 'in-progress' | 'completed';
  assignedContractorId?: string;
  createdAt: Date;
}
```

### Bids & Bidding
```typescript
interface Bid {
  bidId: string;
  contractorId: string;
  quoteAmount: number;
  createdAt: Date;
}

interface BiddingSession {
  biddingSessionId: string;
  problemId: string;
  bids: Bid[];
  selectedContractorId?: string;
  status: 'open' | 'closed' | 'awarded';
}
```

## Database (Firestore)

Collections:
- `users` - User profiles
- `problems` - Problem reports
- `biddingSessions` - Bidding sessions
- `greenCredits` - Credit purchases
- `oneCredits` - User credit balances
- `redemptions` - Reward redemptions
- `rewards` - Available rewards

## n8n Integration

The backend integrates with external n8n workflows for AI/ML tasks.

### Webhook Endpoints
- `/webhook/classify-problem` - Classify & score problems
- `/webhook/allocate-tokens` - Calculate One Credits
- `/webhook/select-bid` - Select winning bid
- `/webhook/compute-heatmap` - Aggregate heatmap data

**Integration details**: See `backend/ARCHITECTURE.md`

## Environment Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your-secret-key

FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=...
# ... other Firebase credentials

N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Development Tools

### Backend
- TypeScript for type safety
- Express.js for REST API
- Firebase Admin SDK for database
- Axios for HTTP requests
- jsonwebtoken for JWT handling

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Context API for state management
- Fetch API or Axios for HTTP

## Documentation

- **`backend/README.md`** - Backend API documentation
- **`backend/ARCHITECTURE.md`** - Backend architecture & design
- **`backend/QUICKSTART.md`** - Backend quick start guide
- **`FRONTEND_INTEGRATION.md`** - How to integrate frontend with backend
- **`backend/GENERATION_REPORT.txt`** - Full generation summary

## Project Structure Details

### Backend Layers

```
Routes Layer
    ↓ (HTTP requests)
Middleware (Auth, RBAC, Error Handling, Logging)
    ↓
Services Layer (Business Logic)
    ├─ User Service
    ├─ Problem Service
    ├─ Bidding Service
    ├─ Credit Service
    └─ Redemption Service
    ↓
Data Layer (Firestore)
    └─ Collections

Integration Layer (n8n)
    └─ HTTP Calls to AI Workflows
```

### Frontend Layers

```
Pages/Screens
    ↓
Components
    ↓
Contexts (Global State)
    ↓
Services (API Client)
    ↓
API Calls
```

## Security Features

✓ JWT-based authentication
✓ Role-based access control
✓ Input validation on all endpoints
✓ CORS protection
✓ Secure password hashing (Firebase Auth)
✓ Environment-based secrets
✓ Error handling without exposing internals

## Scalability

- Firestore auto-scales database
- Express can be containerized
- n8n handles AI/ML workload
- Modular service architecture
- Ready for horizontal scaling

## Deployment

### Backend
```bash
npm run build
npm start
# Or use Docker
docker build -t one-backend .
docker run -p 3001:3001 --env-file .env one-backend
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to static hosting
```

## Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:3001/api/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User",
    "role": "public"
  }'
```

### 3. Create Problem
```bash
curl -X POST http://localhost:3001/api/problems \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Pothole on Main Street",
    "location": {"lat": 28.7041, "lng": 77.1025}
  }'
```

## Common Workflows

### Citizen Reports Problem
1. Frontend: POST `/auth/login`
2. Frontend: POST `/problems` with photo & location
3. Backend: Calls n8n for classification
4. Backend: Calls n8n for token allocation
5. Backend: Updates user credits
6. Problem enters "bidding" status

### Contractor Submits Bid
1. Frontend: POST `/bids` with quote
2. Backend: Stores bid in bidding session
3. (When bidding closes) Backend: Calls n8n for selection
4. Backend: Updates problem with winner
5. Frontend: Shows "You won the bid"

### Company Purchases Credits
1. Frontend: POST `/green-credits/purchase`
2. Backend: Records purchase in Firestore
3. Company dashboard: Shows balance

### User Redeems Reward
1. Frontend: GET `/rewards/list`
2. Frontend: POST `/rewards/redeem` with rewardId
3. Backend: Deducts credits, generates reward code
4. Frontend: Shows redemption confirmation

## File Structure Summary

```
backend/                     # 47 files
├── src/                     # Source code
│   ├── config/              # 3 files (Firebase, env, constants)
│   ├── middleware/          # 4 files (auth, rbac, error, logging)
│   ├── types/               # 6 files (all TypeScript interfaces)
│   ├── services/            # 6 files (business logic)
│   ├── routes/              # 7 files (API endpoints)
│   ├── utils/               # 4 files (errors, logger, helpers, validators)
│   ├── integrations/n8n/    # 2 files (n8n client)
│   ├── app.ts              # Express setup
│   └── server.ts           # Server entry
├── .env.example
├── package.json
├── tsconfig.json
└── README.md

Frontend/                    # Existing React app
├── src/
│   ├── components/
│   ├── screens/
│   ├── contexts/
│   ├── services/
│   └── App.tsx
├── package.json
└── vite.config.ts
```

## Next Steps

1. ✅ Backend is **fully generated** and ready
2. ✅ Types and interfaces are **fully defined**
3. ✅ API endpoints are **fully implemented**
4. ✅ n8n integration layer is **ready**
5. **TODO**: Install backend dependencies (`npm install`)
6. **TODO**: Configure `.env` with credentials
7. **TODO**: Set up Firebase project
8. **TODO**: Configure n8n webhooks
9. **TODO**: Update frontend to call backend APIs
10. **TODO**: Test integration end-to-end

## Support & Questions

Refer to documentation files:
- API usage → `backend/README.md`
- Architecture → `backend/ARCHITECTURE.md`
- Quick setup → `backend/QUICKSTART.md`
- Frontend integration → `FRONTEND_INTEGRATION.md`

---

**The ONE platform is ready for development! 🚀**
