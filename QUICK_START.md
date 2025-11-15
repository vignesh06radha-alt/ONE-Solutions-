# Quick Start Guide - Testing ONE Platform

## 🚀 Fastest Way to Test (Frontend Only - Mock Data)

The frontend works perfectly with mock data, so you can test it immediately without setting up the backend!

### Step 1: Install Dependencies

```bash
# In the root directory
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Open in Browser

The app will automatically open at:
```
http://localhost:3000
```

If it doesn't open automatically, navigate to that URL in your browser.

---

## 🎯 What You'll See

### 1. **Login Screen**
- Beautiful gradient background
- Three role options: Citizen, Company, Contractor
- Click any role to log in

### 2. **Citizen Dashboard** (Recommended to test first)
- **Main Dashboard**: 
  - Your credit balance (250 credits)
  - Quick action buttons
  - **Prominent Rewards Marketplace section** with 3 category cards
  - Recent reports section

- **Report Problem**: 
  - Click "Report to AI Agent"
  - Fill in description and upload image
  - Submit to see AI analysis

- **Rewards Marketplace** (NEW!):
  - Click "Browse All Rewards" or "Browse Rewards"
  - See 12 rewards across 3 categories
  - Filter by category (Transport, Commodities, Partner Offers)
  - Redeem rewards with your credits
  - See real-time credit balance updates

- **My Reports**: 
  - View all your submitted problems
  - See AI analysis results
  - Track problem status

### 3. **Company Dashboard**
- View credit packages
- Purchase green credits
- Track impact

### 4. **Contractor Dashboard**
- View available problems
- Submit bids
- Track your jobs

---

## 🧪 Testing Checklist

### ✅ Test Rewards Marketplace (NEW Feature)
1. Login as **Citizen**
2. Click "Browse All Rewards" button
3. Try filtering by category
4. Click "Redeem Now" on any reward
5. Watch credits decrease
6. See success notification

### ✅ Test Problem Reporting
1. Click "Report to AI Agent"
2. Enter a problem description (e.g., "Large pothole on Main Street")
3. Upload an image (optional)
4. Submit and watch AI analysis
5. See credits earned

### ✅ Test Different Roles
1. Logout (top right)
2. Login as different roles
3. Explore each dashboard

---

## 🔧 Optional: Backend Setup (For Full API Integration)

If you want to test with the backend API:

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Create Environment File

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase (optional - app works without it using mock data)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# n8n (optional - app works without it)
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key
```

### Step 3: Start Backend

```bash
# In backend directory
npm run dev
```

Backend will run on `http://localhost:3001`

### Step 4: Frontend Will Auto-Connect

The frontend automatically tries to connect to the backend. If backend is not available, it falls back to mock data seamlessly.

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Kill the process or change port in vite.config.ts
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
These are usually just type warnings and won't prevent the app from running. The app works fine even with these warnings.

### Backend Connection Errors
This is normal! The app is designed to work with mock data. You'll see console messages like "Using mock rewards data" - this is expected behavior.

---

## 📱 What to Test

### Rewards Marketplace (Main New Feature)
- ✅ View all 12 rewards
- ✅ Filter by category
- ✅ See credit costs
- ✅ Redeem rewards
- ✅ Watch credit balance update
- ✅ See redemption success messages

### Problem Reporting
- ✅ Submit problems
- ✅ See AI analysis
- ✅ Earn credits
- ✅ View problem history

### User Experience
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

---

## 🎨 Features to Explore

1. **Rewards Section** - The new comprehensive marketplace
2. **Problem Reporting** - Submit and track issues
3. **Credit System** - Earn and spend credits
4. **AI Analysis** - See how problems are classified
5. **Multiple Dashboards** - Test different user roles
6. **Beautiful UI** - Modern, polished interface

---

## 💡 Tips

- **Start with Citizen role** - It has the most features including the new rewards marketplace
- **Try redeeming rewards** - See the full flow from browsing to redemption
- **Submit a problem** - Watch the AI analysis process
- **Check different categories** - See how filtering works in rewards
- **Explore all dashboards** - Each role has unique features

---

## 🚀 Ready to Go!

Just run:
```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and start exploring!

The app is fully functional with mock data, so you can test everything immediately without any backend setup.

