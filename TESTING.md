# Testing Guide - TirtaCloud Phase 1

## Manual Testing

### 1. Development Environment Setup
Ensure both servers are running:
```bash
# Backend (Port 8000)
cd backend
php artisan serve

# Frontend (Port 3000)
cd frontend
npm run dev
```

### 2. Authentication Flow
1.  Navigate to `http://localhost:3000`.
2.  Click **Register**.
3.  Create an account (e.g., `user@example.com`, `password`).
4.  Verify you are redirected to `/dashboard`.
5.  Click **Logout** in the sidebar.
6.  Try to access `/dashboard` directly. Verify redirect to `/login`.
7.  Login with credentials.

### 3. Google Drive Integration
**Prerequisite**: You must have `client_secret.json` credentials configured in `.env`.

1.  In Dashboard, go to **Drive Accounts**.
2.  Click **Link Google Drive**.
3.  Complete the Google OAuth flow.
4.  Verify you are redirected back to `/dashboard` and see "Account linked successfully" (check Console logs if UI doesn't show toast yet).
5.  Check database: `SELECT * FROM user_cloud_accounts;` should show the new row.

### 4. File Listing
1.  After linking, go to **Files** (Dashboard Home).
2.  Verify you see a grid of files from your Google Drive.
3.  Verify attributes (Name, Size).

## Automated Testing

### Backend Tests (Laravel)
Run the following command to execute backend feature tests:
```bash
cd backend
php artisan test
```

### Frontend Tests
(To be implemented in Phase 2 using Cypress/Playwright)
