# Frontend Routing Guide

## Routes

The GrantPilot frontend has two main routes:

### Main Dashboard
- **Path**: `/`
- **Component**: `GrantPilotDashboard`
- **Description**: Public-facing grant discovery and filtering interface
- **Features**:
  - Browse and filter Web3 grants
  - Search across chains, categories, and status
  - Subscribe to grant updates
  - AI Grants Agent (demo)

### Admin Dashboard
- **Path**: `/admin`
- **Component**: `AdminDashboard`
- **Description**: Admin interface for managing grants
- **Features**:
  - Create new grants
  - Edit existing grants
  - Delete grants
  - Real-time CRUD operations on PostgreSQL database
  - Protected by admin API key

## Navigation

A floating navigation button appears in the top-right corner:

- **On Main Dashboard** (`/`): Shows "Admin" button with gear icon
- **On Admin Dashboard** (`/admin`): Shows "← Back to Dashboard" button

## Implementation

The routing is implemented using React Router v6:

```tsx
// src/App.tsx
<BrowserRouter>
  <Navigation />  {/* Floating nav button */}
  <Routes>
    <Route path="/" element={<GrantPilotDashboard />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
</BrowserRouter>
```

## Usage

### Accessing the Main Dashboard
Visit: `http://localhost:5173/`

### Accessing the Admin Dashboard
Visit: `http://localhost:5173/admin`

Or click the "Admin" button in the top-right corner of the main dashboard.

### Navigation Between Views
- Click the floating button in the top-right to switch between dashboards
- Direct URL access works for both routes
- Browser back/forward buttons work as expected

## Security Note

The admin route is publicly accessible in the frontend. Security is enforced at the API level:

- Admin API endpoints require `x-admin-api-key` header
- Key is configured in `frontend/.env` as `VITE_ADMIN_API_KEY`
- For production, implement proper authentication (JWT, OAuth, etc.)

## Future Enhancements

Potential routing improvements:

- [ ] 404 Not Found page
- [ ] Protected routes with authentication
- [ ] Grant detail pages (`/grants/:id`)
- [ ] User profile page
- [ ] Subscription management page
- [ ] Analytics/reporting dashboard
