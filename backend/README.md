# ONE Backend

Backend API for the ONE civic-tech platform.

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project with admin credentials
- n8n instance running

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
   - Firebase credentials
   - n8n base URL and API key
   - JWT secret (use a strong random string for production)

### Running

Development mode with auto-reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Problems
- `POST /api/problems` - Create new problem report
- `GET /api/problems/mine` - Get user's problem reports
- `GET /api/problems/:id` - Get problem details
- `GET /api/problems/open` - Get open problems (contractors)
- `PATCH /api/problems/:id/status` - Update problem status

### Bidding
- `POST /api/bids` - Submit bid
- `GET /api/bids/problem/:problemId` - Get bids for problem
- `POST /api/bids/:sessionId/select` - Select winning bid

### Contractors
- `POST /api/contractors/register` - Register as contractor
- `GET /api/contractors/:id` - Get contractor profile
- `GET /api/contractors/domain/:domain` - List contractors by domain

### Green Credits
- `POST /api/green-credits/purchase` - Purchase green credits
- `GET /api/green-credits/balance` - Get credit balance
- `GET /api/green-credits/history` - Get allocation history
- `POST /api/green-credits/allocation` - Allocate credits to problem

### Rewards
- `GET /api/rewards/list` - List available rewards
- `POST /api/rewards/redeem` - Redeem reward
- `GET /api/rewards/history` - Get redemption history
- `GET /api/heatmap` - Get heatmap data (with optional bounds)

## Architecture

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Express middleware
│   ├── types/          # TypeScript interfaces
│   ├── services/       # Business logic
│   ├── integrations/   # External integrations (n8n)
│   ├── routes/         # API route handlers
│   ├── utils/          # Utilities & helpers
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
└── package.json
```

## Integration with n8n

The backend integrates with n8n workflows for:
- Problem classification
- Token allocation
- Bid selection
- Heatmap computation

n8n webhooks should be configured at:
- `/webhook/classify-problem`
- `/webhook/allocate-tokens`
- `/webhook/select-bid`
- `/webhook/compute-heatmap`

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Role-Based Access Control

- `public` - General users reporting problems
- `company` - Company/sponsor users purchasing green credits
- `contractor` - Service providers bidding on problems
- `admin` - Administrative functions
