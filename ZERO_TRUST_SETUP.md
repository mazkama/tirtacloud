# Zero Trust Deployment Setup (aaPanel)

This guide helps you configure your services to run on specific ports for Cloudflare Zero Trust (Tunnel) integration.

**Allocated Ports:**
*   **Laravel Backend**: `127.0.0.1:2605`
*   **Next.js Frontend**: `127.0.0.1:2606`

## 1. Configure Next.js (Frontend)

### Update Port in package.json
We'll update the start script to force port 2606.

**File:** `/frontend/package.json`
```json
"scripts": {
  "dev": "next dev -p 2606",
  "build": "next build",
  "start": "next start -p 2606",
  "lint": "next lint"
}
```

### Process Management (PM2 or Supervisor)
In aaPanel, use **PM2 Manager** or **Supervisor** to keep the frontend running.

**Option A: PM2 Manager (Recommended for Node)**
1.  Open **PM2 Manager** in aaPanel.
2.  Click **Add Project**.
3.  **Path**: `/www/wwwroot/tirtacloud.mazkama.web.id/frontend`
4.  **Startup Script**: `npm run start`
5.  **Name**: `tirtacloud-frontend`
6.  Once added, verify it is listening on port `2606`.

## 2. Configure Laravel (Backend) - Port 2605

Since you want to run Laravel on a specific port (2605) for the Tunnel to consume directly (bypassing Nginx/Apache temporarily or for testing), you can use `php artisan serve`. **However, for production/stability, using Supervisor is best.**

### Option A: Supervisor (Recommended)
1.  Open **Supervisor** in aaPanel settings.
2.  Click **Add Daemon**.
3.  **Name**: `tirtacloud-backend`
4.  **Run User**: `www` (or `ubuntu` if files are owned by ubuntu)
5.  **Run Directory**: `/www/wwwroot/tirtacloud.mazkama.web.id/backend`
6.  **Command**: `php artisan serve --host=127.0.0.1 --port=2605`
7.  Click **Confirm**.

*Note: `php artisan serve` is single-threaded. For high traffic, you should map your Zero Trust domain to Nginx (Port 80) instead. But for "testing via domain", this works.*

## 3. Environment Variables

**Critical**: Your Frontend needs to know the **Public URL** of your Backend to make API calls from the user's browser.

**File:** `/frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=https://be-tirtacloud.mazkama.web.id/api
NEXT_PUBLIC_APP_URL=https://tirtacloud.mazkama.web.id
```

## 4. Cloudflare Tunnel Config

In your Cloudflare Zero Trust Dashboard:

1.  **Public Hostname**: `be-tirtacloud.mazkama.web.id` -> **Service**: `http://127.0.0.1:2605`
2.  **Public Hostname**: `tirtacloud.mazkama.web.id` -> **Service**: `http://127.0.0.1:2606`
