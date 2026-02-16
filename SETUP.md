# TirtaCloud - Setup Guide

## Quick Start

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
# Edit .env with your database and Google OAuth credentials
php artisan key:generate
php artisan migrate
php artisan serve --port=2605
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL
npm run dev
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.com/api/drive/callback`
6. Copy Client ID and Secret to backend `.env`

## Environment Variables

### Backend (.env)
```env
APP_URL=https://tirtacloud.mazkama.web.id
DB_DATABASE=tirtacloud
DB_USERNAME=root
DB_PASSWORD=your_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://tirtacloud.mazkama.web.id/api/drive/callback
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://tirtacloud.mazkama.web.id/api
```

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
pm2 start npm --name "tirtacloud-frontend" -- start
```

### Configure Nginx
```nginx
server {
    listen 443 ssl;
    server_name tirtacloud.mazkama.web.id;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:2605;
    }
}
```

## Features

✅ Multi-Google Drive account support
✅ Private virtual filesystem (upload-only)
✅ Auto-balanced file upload
✅ File preview (PDF, images, videos)
✅ Secure authentication & logout
✅ Responsive UI (desktop + mobile)
✅ Real-time storage stats

## Documentation

- `README.md` - This file (comprehensive guide)
- `ARCHITECTURE.md` - System architecture
- `DEVELOPMENT.md` - Development guide
- `phase2e_walkthrough.md` - Latest implementation details
