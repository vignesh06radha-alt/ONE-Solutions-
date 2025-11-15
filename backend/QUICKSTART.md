# Quick Start Guide - ONE Backend

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- **Firebase credentials** (get from Firebase console)
- **n8n URL** (e.g., `http://localhost:5678`)
- **JWT_SECRET** (generate a strong random string)

### Step 3: Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3001`

---

## Testing the API

### Test 1: Health Check
```bash
curl http://localhost:3001/api/health
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe",
    "role": "public"
  }'
```

### Test 3: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Save the `token` from response.

### Test 4: Create a Problem Report (Authenticated)
```bash
curl -X POST http://localhost:3001/api/problems \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Pothole on Main Street",
    "location": {
      "lat": 28.7041,
      "lng": 77.1025,
      "address": "Main St, City"
    }
  }'
```

---

## Troubleshooting

### Module Not Found Errors
If you see module errors at startup:
1. Ensure all dependencies are installed: `npm install`
2. Check that `.env` file exists and is readable
3. Rebuild: `npm run build`

### Firebase Connection Issues
1. Verify Firebase credentials in `.env`
2. Check Firebase project is active
3. Ensure Firestore database is created

### n8n Integration Issues
1. Check n8n is running at the URL in `.env`
2. Verify webhook endpoints are configured in n8n
3. Check n8n logs for webhook errors

---

## Project Structure Overview

```
backend/src/
├── config/      → Configuration (Firebase, environment)
├── middleware/  → Auth, RBAC, error handling, logging
├── types/       → TypeScript interfaces for all data
├── services/    → Business logic (users, problems, bidding, etc.)
├── routes/      → API endpoint handlers
├── utils/       → Validation, error classes, helpers
└── integrations/n8n/  → External AI service integration
```

---

## Common Tasks

### Add a New API Endpoint
1. Create handler in `src/routes/yourFeature.ts`
2. Create service in `src/services/yourService.ts`
3. Define types in `src/types/your.ts`
4. Import in `src/routes/index.ts`
5. Add auth/RBAC middleware as needed

### Add a New Firestore Collection
1. Define interface in `src/types/`
2. Add collection name to `src/config/constants.ts`
3. Create service methods to query/update
4. Expose via API routes

### Connect New n8n Workflow
1. Create workflow in n8n with webhook trigger
2. Copy webhook URL
3. Add method to `src/integrations/n8n/n8nClient.ts`
4. Call from service layer
5. Update `.env` if needed

---

## Frontend Integration

### Setup API Client (React Example)
```typescript
// src/services/apiClient.ts
const API_URL = 'http://localhost:3001/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    }).then(r => r.json());
  },
  
  // Convenience methods
  get: (endpoint) => this.request(endpoint),
  post: (endpoint, data) => this.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
```

### Login Example
```typescript
const { user, token } = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

localStorage.setItem('token', token);
```

### Report Problem Example
```typescript
const { problem } = await apiClient.post('/problems', {
  description: 'Pothole on Main St',
  photoUrl: 'https://...',
  location: { lat: 28.7041, lng: 77.1025 },
});

console.log(`Earned ${problem.oneCreditsAllocated} credits!`);
```

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t one-backend .
docker run -p 3001:3001 --env-file .env one-backend
```

---

## Documentation

- Full API docs: See `README.md`
- Architecture details: See `ARCHITECTURE.md`
- Type definitions: Check `src/types/`
- Service logic: Check `src/services/`

---

## Support

For issues or questions:
1. Check the error message in backend logs
2. Verify environment configuration
3. Test with curl/Postman
4. Check Firebase & n8n configurations
