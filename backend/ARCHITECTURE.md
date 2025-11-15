# Backend Architecture Summary

## Project Structure Created

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts          # Firebase initialization
│   │   ├── environment.ts       # Environment configuration
│   │   └── constants.ts         # App constants & enums
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── rbac.ts              # Role-based access control
│   │   ├── errorHandler.ts      # Error handling
│   │   └── logging.ts           # Request logging
│   │
│   ├── types/
│   │   ├── user.ts              # User & auth types
│   │   ├── problem.ts           # Problem report types
│   │   ├── bidding.ts           # Bidding & bid types
│   │   ├── credit.ts            # Green & One credit types
│   │   ├── redemption.ts        # Reward redemption types
│   │   └── n8n.ts               # n8n integration types
│   │
│   ├── services/
│   │   ├── authService.ts       # Authentication logic
│   │   ├── userService.ts       # User management
│   │   ├── problemService.ts    # Problem handling
│   │   ├── biddingService.ts    # Bidding logic
│   │   ├── creditService.ts     # Green credit management
│   │   └── redemptionService.ts # Reward redemption
│   │
│   ├── integrations/
│   │   └── n8n/
│   │       ├── n8nClient.ts     # HTTP client for n8n
│   │       └── index.ts         # n8n client export
│   │
│   ├── routes/
│   │   ├── auth.ts              # /api/auth/*
│   │   ├── problems.ts          # /api/problems/*
│   │   ├── bids.ts              # /api/bids/*
│   │   ├── contractors.ts       # /api/contractors/*
│   │   ├── credits.ts           # /api/green-credits/*
│   │   ├── rewards.ts           # /api/rewards/* & /api/heatmap
│   │   └── index.ts             # Route aggregation
│   │
│   ├── utils/
│   │   ├── errors.ts            # Custom error classes
│   │   ├── logger.ts            # Logging utilities
│   │   ├── helpers.ts           # Helper functions
│   │   └── validators.ts        # Input validation
│   │
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server startup
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore patterns
└── README.md                    # Documentation
```

## Key Features Implemented

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (public, company, contractor, admin)
- Middleware for protected endpoints
- Token refresh mechanism

### 2. Problem Reporting System
- Create & retrieve problem reports
- Integration with n8n for AI classification
- Automatic token allocation based on severity
- Heatmap data aggregation
- Problem status tracking

### 3. Bidding System
- Contractors submit bids on problems
- Bidding session management
- n8n-powered bid selection (based on cost, trust score, performance)
- Contractor assignment

### 4. Green Credit System
- Companies purchase green credits
- Credit allocation to problems
- Balance tracking
- Allocation history logging

### 5. Reward Redemption
- One Credits earned from problem reports
- Redemption for rewards (transport, commodity, partner offers)
- Expiration tracking
- Redemption history

### 6. n8n Integration
- Problem classification workflow calls
- Token allocation workflow calls
- Bid selection workflow calls
- Error handling and retry logic

## API Endpoints Summary

### Auth (6 endpoints)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Problems (5 endpoints)
```
POST   /api/problems
GET    /api/problems/mine
GET    /api/problems/:id
GET    /api/problems/open
PATCH  /api/problems/:id/status
```

### Bidding (3 endpoints)
```
POST   /api/bids
GET    /api/bids/problem/:problemId
POST   /api/bids/:sessionId/select
```

### Contractors (3 endpoints)
```
POST   /api/contractors/register
GET    /api/contractors/:id
GET    /api/contractors/domain/:domain
```

### Green Credits (4 endpoints)
```
POST   /api/green-credits/purchase
GET    /api/green-credits/balance
GET    /api/green-credits/history
POST   /api/green-credits/allocation
```

### Rewards & Heatmap (4 endpoints)
```
GET    /api/rewards/list
POST   /api/rewards/redeem
GET    /api/rewards/history
GET    /api/heatmap
```

## Data Models

All TypeScript interfaces are defined in `src/types/` for:
- Users (Public, Company, Contractor)
- Problems & Reports
- Bidding Sessions & Bids
- Green & One Credits
- Redemptions & Rewards
- n8n Request/Response formats

## Database (Firestore) Collections

- `users` - User profiles with roles
- `problems` - Problem reports
- `biddingSessions` - Bidding sessions for problems
- `bids` - Individual bids
- `greenCredits` - Green credit purchases & allocations
- `oneCredits` - One credit balances
- `redemptions` - Reward redemptions
- `rewards` - Available rewards catalog

## Integration Flows

### Problem Creation Flow
1. Frontend POSTs to `/api/problems`
2. Backend creates problem record (pending status)
3. Calls n8n to classify problem (category, severity, environmental impact)
4. Calls n8n to allocate One Credits based on classification
5. Updates problem with results, moves to "bidding" status
6. Updates user's One Credit balance

### Bidding Selection Flow
1. Contractors submit bids via `/api/bids`
2. Bidding session stores all bids
3. Bidding deadline reached → trigger bid selection
4. Calls n8n with all bids + contractor metrics
5. n8n returns selected bid with rationale
6. Backend updates problem with assigned contractor
7. Notifications sent to contractors

## Next Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Fill in Firebase credentials
   - Set n8n endpoints
   - Set JWT secret for production

3. **Set Up Firebase**
   - Create Firestore database
   - Enable authentication
   - Set up Storage bucket for photos

4. **Set Up n8n**
   - Create workflows for:
     - `/webhook/classify-problem`
     - `/webhook/allocate-tokens`
     - `/webhook/select-bid`

5. **Test API**
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

6. **Frontend Integration**
   - Update frontend API client to call backend endpoints
   - Use JWT token from login for authenticated requests
   - Example: `Authorization: Bearer <JWT_TOKEN>`

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Success responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Security Considerations

- JWT tokens expire after 7 days (configurable)
- Role-based middleware protects endpoints
- Input validation on all requests
- Firebase Auth handles password hashing
- Environment variables for sensitive data
- CORS enabled for frontend origin only

## Scalability

- Firestore auto-scales
- Firebase Functions can replace Express layer later
- n8n workflows handle heavy AI/ML workload
- Modular service architecture allows independent scaling
- Ready for containerization (Docker)
