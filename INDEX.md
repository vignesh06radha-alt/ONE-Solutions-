# ONE Platform - Documentation Index

Welcome to the ONE Platform repository! This document guides you through all available documentation.

## 🚀 Quick Start (Start Here!)

**New to the project?** Read these first:

1. **[BACKEND_COMPLETE.txt](./BACKEND_COMPLETE.txt)** ⭐
   - High-level summary of what was generated
   - Key features & capabilities
   - Quick start steps
   - Next steps checklist

2. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**
   - Complete project structure
   - System architecture overview
   - All three stakeholders explained
   - Integration architecture

## 📚 Detailed Documentation

### Backend Implementation

- **[backend/README.md](./backend/README.md)**
  - Complete API endpoint reference
  - Setup instructions
  - Architecture overview
  - Error handling format

- **[backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md)**
  - In-depth system design
  - Data models & schemas
  - Integration patterns
  - Security considerations

- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)**
  - 5-minute setup guide
  - Example curl commands
  - Testing endpoints
  - Troubleshooting tips

- **[backend/GENERATION_REPORT.txt](./backend/GENERATION_REPORT.txt)**
  - Complete file statistics
  - Feature checklist
  - Quality metrics
  - Generation summary

### Visual & Reference

- **[ARCHITECTURE_VISUAL.md](./ARCHITECTURE_VISUAL.md)**
  - System diagrams
  - Data flow illustrations
  - Request/response flows
  - Database relationships
  - Component architecture

### Frontend Integration

- **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)**
  - How to connect React frontend to backend
  - API client setup examples
  - All 12 use case implementations
  - Context/state management integration
  - Error handling patterns
  - Protected routes implementation
  - Polling for status updates

## 📊 Project Structure

```
ONE_Solutions/
├── backend/                    # ✓ Generated Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── types/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── integrations/n8n/
│   ├── package.json
│   ├── tsconfig.json
│   └── [documentation files]
│
├── [existing frontend files]   # React/Vite app
│
└── [Root Documentation]
    ├── PROJECT_OVERVIEW.md
    ├── FRONTEND_INTEGRATION.md
    ├── ARCHITECTURE_VISUAL.md
    ├── BACKEND_COMPLETE.txt
    └── This file (INDEX.md)
```

## 🔑 Key Concepts

### The ONE Platform consists of:

1. **Citizens/Public Users**
   - Report problems via text + photo + location
   - Earn One Credits
   - Redeem for rewards

2. **Companies/Sponsors**
   - Purchase Green Credits
   - Fund environmental solutions
   - Track impact

3. **Contractors/SMEs**
   - Register by expertise
   - Bid on problems
   - Build reputation

4. **n8n AI Agent**
   - Classifies problems
   - Allocates credits
   - Selects winning contractors

### The Backend provides:
- REST API (23 endpoints)
- JWT authentication
- Role-based access control
- Firebase Firestore integration
- n8n AI orchestration
- Credit system (Green & One)
- Bidding engine
- Reward system

## 🛠️ Setup Checklist

### Step 1: Install Backend
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with:
# - Firebase credentials
# - n8n base URL
# - JWT secret
```

### Step 3: Start Backend
```bash
npm run dev
# Server runs on http://localhost:3001
```

### Step 4: Update Frontend
- Update API base URL to `http://localhost:3001/api`
- Store JWT token from login
- Include in all authenticated requests
- See FRONTEND_INTEGRATION.md for code

### Step 5: Test Integration
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"OK"}
```

## 📖 API Reference Quick Links

### Authentication
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Refresh: `POST /api/auth/refresh`
- Logout: `POST /api/auth/logout`

### Problems
- Report: `POST /api/problems`
- List Mine: `GET /api/problems/mine`
- Get One: `GET /api/problems/:id`
- Open Problems: `GET /api/problems/open`
- Update Status: `PATCH /api/problems/:id/status`

### Bidding
- Submit: `POST /api/bids`
- List Bids: `GET /api/bids/problem/:problemId`
- Select Winner: `POST /api/bids/:sessionId/select`

### Contractors
- Register: `POST /api/contractors/register`
- Get Profile: `GET /api/contractors/:id`
- By Domain: `GET /api/contractors/domain/:domain`

### Green Credits
- Purchase: `POST /api/green-credits/purchase`
- Balance: `GET /api/green-credits/balance`
- History: `GET /api/green-credits/history`
- Allocate: `POST /api/green-credits/allocation`

### Rewards
- List: `GET /api/rewards/list`
- Redeem: `POST /api/rewards/redeem`
- History: `GET /api/rewards/history`
- Heatmap: `GET /api/heatmap`

**Full API docs**: See `backend/README.md`

## 🔌 n8n Integration Points

The backend calls these n8n webhooks:

1. **Problem Classification**
   - Endpoint: `/webhook/classify-problem`
   - Input: description, photo URL, location
   - Output: category, severity, environmental priority

2. **Token Allocation**
   - Endpoint: `/webhook/allocate-tokens`
   - Input: category, severity scores
   - Output: one credits to allocate

3. **Bid Selection**
   - Endpoint: `/webhook/select-bid`
   - Input: problem ID, all bids, contractor metrics
   - Output: selected bid ID, rationale

4. **Heatmap Computation**
   - Endpoint: `/webhook/compute-heatmap`
   - Input: geographic bounds
   - Output: aggregated problem data

**Setup guide**: Create these workflows in your n8n instance and update N8N_BASE_URL in .env

## 💾 Database Schema

### Collections in Firestore

```
users              → User profiles (all roles)
problems           → Problem reports with AI analysis
biddingSessions    → Bidding sessions for problems
bids               → Individual bid submissions
greenCredits       → Company green credit purchases
oneCredits         → User credit balances & history
redemptions        → Reward redemptions
rewards            → Available rewards catalog
```

See `backend/ARCHITECTURE.md` for detailed schema

## 🔐 Security Features

✓ JWT authentication with expiration
✓ Role-based access control (RBAC)
✓ Input validation on all endpoints
✓ CORS protection
✓ Firebase Auth password hashing
✓ Environment-based secrets
✓ Error handling without info leakage

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t one-backend .
docker run -p 3001:3001 --env-file .env one-backend
```

## 📞 Common Issues & Solutions

### "Module not found"
→ Run `npm install` in backend directory

### "Firebase connection error"
→ Check .env Firebase credentials and Firestore is created

### "CORS error"
→ Verify CORS_ORIGIN in .env matches frontend URL

### "n8n endpoints not responding"
→ Check N8N_BASE_URL and webhooks are configured

### "Port already in use"
→ Change PORT in .env (default: 3001)

See `backend/QUICKSTART.md` for more troubleshooting

## 📊 Architecture at a Glance

```
Frontend (React)
     ↓ (HTTP REST)
Backend (Express)
     ├─ Routes (23 endpoints)
     ├─ Services (6 services)
     ├─ Middleware (Auth, RBAC)
     └─ Database (Firestore)
          ├─ n8n (AI Workflows)
          └─ Firebase Storage (Files)
```

See `ARCHITECTURE_VISUAL.md` for detailed diagrams

## 📝 File Generated Statistics

- **Total Files**: 47
- **TypeScript Files**: 40+
- **Lines of Code**: 2,500+
- **TypeScript Interfaces**: 50+
- **API Endpoints**: 23
- **Database Collections**: 8
- **Documentation Files**: 7

## 🎓 Learning Path

1. Start with: `BACKEND_COMPLETE.txt`
2. Understand: `PROJECT_OVERVIEW.md`
3. Architecture: `ARCHITECTURE_VISUAL.md`
4. Implementation: `backend/ARCHITECTURE.md`
5. API Reference: `backend/README.md`
6. Setup Guide: `backend/QUICKSTART.md`
7. Integration: `FRONTEND_INTEGRATION.md`
8. Deep Dive: Read source code in `backend/src/`

## 🤝 Contributing Guidelines

When adding new features:

1. Add TypeScript interfaces to `src/types/`
2. Implement business logic in `src/services/`
3. Add route handler in `src/routes/`
4. Include middleware (auth, rbac) as needed
5. Add input validation
6. Document in code comments
7. Update relevant .md files

## 📅 Version Information

- **Backend Version**: 1.0.0
- **Node.js**: 16+
- **TypeScript**: 5.3+
- **Express**: 4.18+
- **Firebase Admin**: 12.0+

## 📞 Support

For issues:
1. Check troubleshooting in `backend/QUICKSTART.md`
2. Review architecture in `backend/ARCHITECTURE.md`
3. Check API docs in `backend/README.md`
4. Examine source code in `backend/src/`
5. Review frontend integration guide in `FRONTEND_INTEGRATION.md`

## 🎉 Next Steps

**Immediately**:
1. Read `BACKEND_COMPLETE.txt`
2. Run `npm install` in backend
3. Copy and configure `.env`

**Soon**:
1. Start backend with `npm run dev`
2. Test API endpoints with curl
3. Update frontend API client
4. Configure n8n webhooks

**Later**:
1. Deploy to production
2. Set up monitoring
3. Performance optimization
4. Expand features

---

**Questions?** Check the documentation files listed above or examine the source code.

**Ready to start?** See `BACKEND_COMPLETE.txt` or `backend/QUICKSTART.md`

**Last Updated**: November 15, 2025
**Backend Status**: ✅ Complete and Production-Ready
