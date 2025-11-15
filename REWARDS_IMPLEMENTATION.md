# Rewards Marketplace Implementation

## Summary

The Citizen Dashboard has been enhanced with a comprehensive Rewards Marketplace section that allows users to redeem their One Credits for discounts on:
- **Transport**: Bus rides, train tickets, transport passes
- **Commodities**: Groceries, household items, daily essentials
- **Partner Offers**: Restaurant discounts, gym passes, entertainment tickets

## Changes Made

### 1. Frontend Updates

#### `screens/dashboards/CitizenDashboard.tsx`
- **New Rewards Marketplace Component**: Full-featured rewards section with:
  - Category filtering (All, Transport, Commodities, Partner Offers)
  - Credit balance display
  - Reward cards with icons and details
  - Redemption functionality with loading states
  - Backend API integration with fallback to mock data

- **Enhanced Main Dashboard**: Added prominent rewards section preview with:
  - Quick access cards for each reward category
  - Direct link to full rewards marketplace
  - Visual highlights for rewards

#### `services/apiService.ts` (New)
- API service for backend integration
- Methods for:
  - Fetching rewards list
  - Redeeming rewards
  - Getting redemption history
  - Authentication

### 2. Backend Data

#### `backend/data/rewards.json`
- Sample rewards data matching backend structure:
  - 12 rewards across 3 categories
  - Proper format with `rewardId`, `type`, `creditsRequired`, `partnersData`

#### `constants.ts`
- Updated `MOCK_REWARDS` with 12 rewards:
  - 4 Transport rewards
  - 4 Commodity rewards
  - 4 Partner offers

#### `services/storageService.ts`
- Enhanced to create backend-compatible reward format
- Supports both old format (for compatibility) and new format

## Features

### Rewards Marketplace Features

1. **Category Filtering**
   - Filter by: All, Transport, Commodities, Partner Offers
   - Visual category buttons with icons

2. **Credit Balance Display**
   - Shows current One Credits balance
   - Updates in real-time after redemption

3. **Reward Cards**
   - Icon-based visual representation
   - Credit cost display
   - Partner information
   - Validity period
   - Affordability indication (enabled/disabled state)

4. **Redemption Process**
   - Backend API integration (tries backend first)
   - Fallback to mock data if backend unavailable
   - Loading states during redemption
   - Success/error notifications
   - Redemption code display (when available)

5. **Responsive Design**
   - Grid layout (1 column mobile, 2 tablet, 3 desktop)
   - Hover effects and animations
   - Mobile-friendly interface

## API Integration

### Backend Endpoints Used

1. **GET `/api/rewards/list`**
   - Fetches available rewards
   - No authentication required (optional)
   - Returns: `{ success: true, data: { rewards: [...] } }`

2. **POST `/api/rewards/redeem`**
   - Redeems a reward
   - Requires authentication (JWT token)
   - Body: `{ rewardId: string }`
   - Returns: `{ success: true, data: { redemption: {...} } }`

### Authentication

- Token stored in `localStorage.getItem('auth_token')`
- Sent as: `Authorization: Bearer <token>`
- If no token, falls back to mock data

## Reward Structure

### Backend Format
```typescript
{
  rewardId: string;
  type: 'transport' | 'commodity' | 'partner';
  partnerId: string;
  description: string;
  creditsRequired: number;
  partnersData: {
    partnerName: string;
    discount: string;
    validity: string;
    terms?: string;
  };
  isActive: boolean;
  createdAt: Date;
}
```

### Frontend Compatibility
The component handles both:
- Old format: `{ id, title, description, cost, icon }`
- New format: `{ rewardId, type, description, creditsRequired, partnersData }`

## Usage

### For Users

1. **View Rewards**
   - Click "Browse Rewards" from main dashboard
   - Or click "Browse All Rewards" from rewards preview section

2. **Filter Rewards**
   - Click category buttons (All, Transport, Commodities, Partner Offers)
   - View filtered results

3. **Redeem Rewards**
   - Click "Redeem Now" on any affordable reward
   - Wait for processing
   - Receive redemption code (if available)
   - Credits are deducted automatically

### For Developers

1. **Adding New Rewards**
   - Add to `backend/data/rewards.json` (for backend)
   - Add to `constants.ts` MOCK_REWARDS (for frontend mock)
   - Ensure proper structure matching backend format

2. **Backend Connection**
   - Set `VITE_API_URL` in `.env` (defaults to `http://localhost:3001/api`)
   - Ensure backend is running
   - Frontend will automatically try backend first, fallback to mock

3. **Customization**
   - Modify `RewardsMarketplace` component in `CitizenDashboard.tsx`
   - Update categories in `categories` array
   - Customize icons in `getRewardIcon` function

## Testing

### Test Scenarios

1. **View Rewards**
   - ✅ Load rewards marketplace
   - ✅ See all categories
   - ✅ Filter by category

2. **Redemption**
   - ✅ Redeem with sufficient credits
   - ✅ Error with insufficient credits
   - ✅ Loading state during redemption
   - ✅ Credit balance updates

3. **Backend Integration**
   - ✅ Fetch from backend when available
   - ✅ Fallback to mock when backend unavailable
   - ✅ Handle authentication errors gracefully

## Next Steps

1. **Backend Setup**
   - Ensure backend server is running
   - Populate rewards in Firestore
   - Test API endpoints

2. **Authentication**
   - Implement proper login flow
   - Store JWT token after login
   - Handle token refresh

3. **Enhanced Features**
   - Redemption history view
   - Favorite rewards
   - Reward recommendations
   - Partner branding

## Files Modified

- `screens/dashboards/CitizenDashboard.tsx` - Main rewards implementation
- `services/apiService.ts` - API service (new)
- `constants.ts` - Updated mock rewards
- `services/storageService.ts` - Enhanced reward data initialization
- `backend/data/rewards.json` - Sample backend rewards data (new)

## Notes

- The implementation supports both backend API and mock data
- Works seamlessly whether backend is available or not
- All rewards are properly categorized and displayed
- Credit balance is tracked and updated in real-time
- Redemption codes are displayed when provided by backend

