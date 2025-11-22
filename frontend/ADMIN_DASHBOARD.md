# Admin Dashboard - Usage Guide

## Overview

The AdminDashboard component is a full-featured CRUD interface for managing grants in your Web3 Grants Aggregator. It connects directly to your NestJS backend API.

## Features

✅ **Real-time API Integration** - Fetches grants from PostgreSQL database via NestJS API
✅ **Create Grants** - Add new grant opportunities
✅ **Update Grants** - Edit existing grant details
✅ **Delete Grants** - Remove grants from the database
✅ **Loading States** - Visual feedback during API operations
✅ **Error Handling** - Clear error messages with dismissal
✅ **Protected Endpoints** - Admin API key authentication

## Setup

### 1. Configure Environment Variables

Create `/frontend/.env` with:

```env
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_API_KEY=admin-secret-key-12345
```

Make sure this matches your backend's `ADMIN_API_KEY` in `backend/.env`.

### 2. Import the Component

```tsx
import { AdminDashboard } from "./pages";

function App() {
  return <AdminDashboard />;
}
```

Or use with routing:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "./pages";
import GrantPilotDashboard from "./GrantPilotDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GrantPilotDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Usage

### Starting the Backend

```bash
cd backend
npm run start:dev
# Or with Docker:
npm run docker:up
```

Backend will run at: `http://localhost:3001`

### Starting the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

### Accessing the Admin Dashboard

Visit: `http://localhost:5173` (or your configured route)

## API Endpoints Used

The AdminDashboard uses these backend endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/grants` | Fetch all grants | No |
| POST | `/api/grants` | Create new grant | Yes (Admin Key) |
| PUT | `/api/grants/:id` | Update grant | Yes (Admin Key) |
| DELETE | `/api/grants/:id` | Delete grant | Yes (Admin Key) |

## Grant Fields

When creating or editing a grant, all fields are required:

- **Title**: Grant program name (e.g., "BNB Chain Builder Grants")
- **Chain**: Blockchain name (e.g., "BNB Chain", "Solana", "Ethereum / L2s")
- **Category**: One of: Infra, DeFi, Gaming, Consumer, Public Goods, Ecosystem, Tooling, ZK, L2 Infra, Hackathons
- **Tag**: Short descriptive tags (e.g., "Infra · DeFi · Tooling")
- **Amount**: Funding range (e.g., "Up to $150k", "$5k - $50k")
- **Status**: Open | Upcoming | Closed
- **Deadline**: Exact date or "Rolling" (e.g., "Dec 30, 2025")
- **Summary**: 2-3 sentence description
- **Focus**: 1-2 sentences on ideal applicant profile
- **Link**: Application URL

## Operations

### Creating a Grant

1. Click **"+ Add new grant"** button
2. Fill in all required fields
3. Click **"Save"**
4. Grant will be created in the database and appear in the table

### Editing a Grant

1. Click **"Edit"** button on any grant row
2. Modify fields as needed
3. Click **"Save"**
4. Changes will be persisted to the database

### Deleting a Grant

1. Click **"Delete"** button on any grant row
2. Confirm the deletion
3. Grant will be removed from the database

## Error Handling

If an error occurs:
- Check that the backend is running
- Verify your `VITE_ADMIN_API_KEY` matches the backend's `ADMIN_API_KEY`
- Check browser console for detailed error messages
- Ensure PostgreSQL database is accessible

Common errors:
- **401 Unauthorized**: Admin API key mismatch
- **404 Not Found**: Grant doesn't exist or API endpoint wrong
- **500 Server Error**: Backend or database issue

## Security Notes

⚠️ **Important**: The admin API key is currently stored in `.env` files. For production:

1. Implement proper authentication (JWT, OAuth, etc.)
2. Use secure session management
3. Don't commit `.env` files to git (already in `.gitignore`)
4. Use environment-specific keys
5. Consider rate limiting and IP whitelisting

## Styling

The component uses:
- Tailwind CSS for styling
- Dark theme with amber accents
- Responsive design
- Custom status badges (green=Open, amber=Upcoming, gray=Closed)

## Integration with Main Dashboard

To show admin-managed grants on your main GrantPilot dashboard:

```tsx
// In GrantPilotDashboard.tsx
import { useState, useEffect } from "react";
import { grantsApi } from "./api/grants";

function GrantPilotDashboard() {
  const [grants, setGrants] = useState([]);

  useEffect(() => {
    grantsApi.getAll().then(setGrants);
  }, []);

  // Rest of your dashboard code...
}
```

This will display real grants from the database instead of mock data.

## Troubleshooting

### Backend not connecting

```bash
# Check backend is running
curl http://localhost:3001/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### CORS errors

Make sure backend `.env` has:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Admin operations failing

Check that your admin API key matches:
```bash
# In backend/.env
ADMIN_API_KEY=admin-secret-key-12345

# In frontend/.env
VITE_ADMIN_API_KEY=admin-secret-key-12345
```

## Development

The component is fully typed with TypeScript. Check `src/data/grants.ts` for type definitions:

```typescript
interface Grant {
  id: number;
  chain: string;
  category: string;
  title: string;
  // ... other fields
}
```

API functions are in `src/api/grants.ts`.

---

Happy grant managing! 🚀
