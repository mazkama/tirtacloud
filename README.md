# TirtaCloud - Multi-Google Drive Virtual Filesystem

## 📋 Project Overview

TirtaCloud adalah sistem **private virtual filesystem** yang mengintegrasikan multiple Google Drive accounts dengan konsep:
- **VFS Privat:** Hanya menampilkan file yang diupload melalui sistem
- **Multi-Cloud Storage:** Akumulasi storage dari beberapa akun Google Drive
- **Auto-Balancing:** Upload otomatis ke akun dengan free space terbesar
- **File Preview:** Stream PDF, image, video langsung di browser
- **Secure Auth:** Token-based authentication dengan logout aman

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────┐
│         User (Browser)                  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Frontend (Next.js SPA)             │
│  - Login/Register/Logout                │
│  - Dashboard with Sidebar               │
│  - File Browser (VFS)                   │
│  - Storage Stats Dashboard              │
│  - Upload Dialog with Progress          │
│  - File Preview (PDF/Image/Video)       │
└─────────────┬───────────────────────────┘
              │ HTTPS/API
┌─────────────▼───────────────────────────┐
│      Backend (Laravel API)              │
│  - Authentication (Sanctum)             │
│  - VFS Management                       │
│  - Upload Balancer                      │
│  - Google Drive Integration             │
│  - File Streaming                       │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐      ┌───────▼──────────┐
│ MySQL  │      │  Google Drive    │
│Database│      │  (Multiple Accts)│
└────────┘      └──────────────────┘
```

### VFS Private Folder Concept
```
Google Drive Account 1:
├── Personal/
│   ├── vacation.jpg        ← NOT visible in TirtaCloud
│   └── work.pdf            ← NOT visible in TirtaCloud
└── TirtaCloud/
    └── report.pdf          ← Uploaded via TirtaCloud

Google Drive Account 2:
├── Photos/
│   └── family.jpg          ← NOT visible in TirtaCloud
└── TirtaCloud/
    └── presentation.pptx   ← Uploaded via TirtaCloud

TirtaCloud VFS (User View):
/
├── Documents/
│   └── report.pdf          ← Only uploaded files
└── Presentations/
    └── presentation.pptx   ← Only uploaded files
```

---

## 🗄️ Database Schema

### `users`
```sql
id              BIGINT PRIMARY KEY
name            VARCHAR(255)
email           VARCHAR(255) UNIQUE
password        VARCHAR(255)
role            VARCHAR(50) DEFAULT 'user'
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `user_cloud_accounts`
```sql
id              BIGINT PRIMARY KEY
user_id         BIGINT → users.id
provider        VARCHAR(50) = 'google_drive'
account_email   VARCHAR(255)
account_name    VARCHAR(255)
access_token    TEXT (encrypted)
refresh_token   TEXT (encrypted)
expires_at      TIMESTAMP
total_storage   BIGINT (bytes)
used_storage    BIGINT (bytes)
is_active       BOOLEAN DEFAULT true
metadata        JSON
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `virtual_files`
```sql
id                  BIGINT PRIMARY KEY
user_id             BIGINT → users.id
cloud_account_id    BIGINT → user_cloud_accounts.id
parent_virtual_id   BIGINT → virtual_files.id (nullable)
name                VARCHAR(255)
virtual_path        VARCHAR(512)
mime_type           VARCHAR(255)
size                BIGINT (bytes)
is_folder           BOOLEAN DEFAULT false
cloud_file_id       VARCHAR(255)  -- Google Drive file ID
metadata            JSON
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user (user_id)
INDEX idx_user_parent (user_id, parent_virtual_id)
INDEX idx_virtual_path (user_id, virtual_path)
```

---

## 🔌 API Endpoints

### Authentication
```
POST /api/register          - Register new user
POST /api/login             - Login user
POST /api/logout            - Logout (revoke token)
GET  /api/user              - Get authenticated user
```

### Google Drive Integration
```
GET  /api/drive/auth-url    - Get OAuth URL
POST /api/drive/callback    - Handle OAuth callback
GET  /api/drive/files       - List files (legacy)
```

### Virtual Filesystem (VFS)
```
GET    /api/vfs/files?path=/Documents  - List files in virtual path
POST   /api/vfs/upload                 - Upload file (auto-balanced)
GET    /api/vfs/preview/{id}           - Stream file for preview
GET    /api/vfs/download/{id}          - Get download URL
DELETE /api/vfs/files/{id}             - Delete file
POST   /api/vfs/create-folder          - Create virtual folder
```

### Storage Stats
```
GET /api/storage/stats      - Comprehensive storage statistics
GET /api/storage/accounts   - Per-account breakdown
```

---

## 📁 Project Structure

### Backend (Laravel)
```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AuthController.php
│   │       ├── DriveController.php
│   │       └── Api/
│   │           ├── VirtualFilesController.php
│   │           └── StorageController.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── UserCloudAccount.php
│   │   └── VirtualFile.php
│   └── Services/
│       ├── GoogleDriveService.php
│       ├── VirtualFilesystemService.php
│       ├── UploadBalancerService.php
│       └── StorageStatsService.php
├── database/
│   └── migrations/
│       ├── create_users_table.php
│       ├── create_user_cloud_accounts_table.php
│       └── create_virtual_files_table.php
└── routes/
    └── api.php
```

### Frontend (Next.js)
```
frontend/
├── app/
│   ├── layout.tsx                  # Root with AuthProvider
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/
│       ├── layout.tsx              # Sidebar layout
│       ├── page.tsx                # Dashboard home
│       ├── files/page.tsx          # VFS file browser
│       ├── storage/page.tsx        # Storage stats
│       ├── accounts/page.tsx       # Google Drive accounts
│       └── settings/page.tsx
├── components/
│   ├── dashboard/
│   │   ├── UploadDialog.tsx
│   │   └── FilePreview.tsx
│   └── ui/                         # Shadcn components
├── hooks/
│   └── useAuth.tsx                 # Auth context
└── lib/
    └── axios.ts                    # API client
```

---

## 🚀 Setup Instructions

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Google Cloud Project with Drive API enabled

### Backend Setup

1. **Clone & Install**
```bash
cd backend
composer install
cp .env.example .env
```

2. **Configure Environment**
```env
APP_URL=https://tirtacloud.mazkama.web.id
DB_DATABASE=tirtacloud
DB_USERNAME=root
DB_PASSWORD=your_password

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://tirtacloud.mazkama.web.id/api/drive/callback
```

3. **Database Migration**
```bash
php artisan key:generate
php artisan migrate
```

4. **Start Server**
```bash
php artisan serve --port=2605
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
```env
# .env.local
NEXT_PUBLIC_API_URL=https://tirtacloud.mazkama.web.id/api
```

3. **Development**
```bash
npm run dev
```

4. **Production Build**
```bash
npm run build
npm start
```

---

## 🔄 Key Workflows

### 1. User Registration & Login
```
User → Register → Email + Password
→ Backend creates user
→ Returns JWT token
→ Frontend stores token in localStorage
→ Redirect to /dashboard
```

### 2. Link Google Drive Account
```
User → Dashboard → Accounts → Link Google Drive
→ Backend generates OAuth URL
→ User authorizes in Google
→ Google redirects to callback
→ Backend stores encrypted tokens
→ Fetch storage quota
→ Save to user_cloud_accounts
```

### 3. Upload File (Auto-Balanced)
```
User → Files → Upload Files
→ Select files in UploadDialog
→ POST /api/vfs/upload
→ UploadBalancer selects account with most free space
→ Upload to Google Drive
→ Create entry in virtual_files
→ Update used_storage
→ Return success + account info
→ Refresh file list
```

### 4. File Preview
```
User → Files → Click file → Preview
→ FilePreview dialog opens
→ GET /api/vfs/preview/{id}
→ Backend verifies user ownership
→ Stream file from Google Drive
→ Return with Content-Type header
→ Browser renders inline (PDF/image/video)
```

### 5. Secure Logout
```
User → Click Logout
→ POST /api/logout
→ Backend revokes token in database
→ Frontend clears localStorage
→ Clear auth context (user = null)
→ Redirect to landing page (/)
```

---

## 🎨 UI/UX Features

### Responsive Sidebar
- **Desktop:** Always visible, 256px width
- **Mobile:** Collapsible with hamburger menu
- **Active Route:** Highlighted with purple accent

### File Browser
- **Breadcrumb Navigation:** Home → Folder → Subfolder
- **File Icons:** Folder (yellow), Image (purple), Video (red), PDF (gray)
- **Actions Menu:** Preview, Download, Delete
- **Storage Indicator:** Real-time usage bar

### Upload Dialog
- **Multi-file Selection:** Drag & drop or click
- **Progress Bar:** Per-file and overall progress
- **Account Display:** Shows which account was used
- **Error Handling:** Clear error messages

### File Preview
- **PDF:** iframe preview
- **Images:** Inline display with zoom
- **Videos:** HTML5 player with controls
- **Audio:** HTML5 audio player
- **Responsive:** Max-w-5xl, 85vh height

---

## 🔒 Security

### Authentication
- **Token-based:** Laravel Sanctum JWT
- **Secure Storage:** localStorage (frontend), database (backend)
- **Token Revocation:** Logout deletes token from DB

### Cloud Credentials
- **Encryption:** Laravel encryption for access_token/refresh_token
- **Auto-refresh:** Token refresh when expired
- **Scope:** Read/write Google Drive access

### API Security
- **Middleware:** `auth:sanctum` on all protected routes
- **CORS:** Configured for frontend domain
- **Rate Limiting:** Laravel rate limiter
- **User Isolation:** All queries filtered by user_id

---

## 📊 Storage Management

### Auto-Balancing Algorithm
```php
1. Get all active Google Drive accounts for user
2. Calculate available_space = total_storage - used_storage
3. Filter accounts with sufficient space (fileSize < available_space)
4. Sort by available_space DESC
5. Return account[0] (most free space)
```

### Storage Stats
- **Total Storage:** Sum of all account total_storage
- **Used Storage:** Sum of all account used_storage
- **Available:** Total - Used
- **Usage Percent:** (Used / Total) * 100
- **File Count:** Count of virtual_files
- **Account Count:** Count of active accounts

---

## 🚢 Deployment

### Production Setup (Nginx + PM2)

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl;
    server_name tirtacloud.mazkama.web.id;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend (Laravel)
    location /api {
        proxy_pass http://localhost:2605;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**PM2 Process Manager:**
```bash
# Frontend
pm2 start npm --name "tirtacloud-frontend" -- start

# Backend (if using php-fpm)
pm2 start "php artisan serve --port=2605" --name "tirtacloud-backend"
```

---

## 📝 Important Notes

### VFS Private Folder Concept
✅ **VFS hanya menampilkan file yang diupload melalui TirtaCloud**
✅ **User TIDAK melihat file/folder lama di Google Drive mereka**
✅ **Tidak ada background sync untuk file lama**
✅ **Storage stats tetap akurat (dari Google Drive API)**

### Why This Approach?
- **Privacy:** Clear separation antara TirtaCloud dan personal files
- **Performance:** Tidak perlu sync jutaan file
- **Simplicity:** Upload = create virtual_files entry
- **Scalability:** Mudah dikembangkan ke multi-cloud (S3, Dropbox, dll)

---

## 🎯 Current Status

### ✅ Completed Features
- [x] Authentication (Login/Register/Logout)
- [x] Multi-Google Drive account linking
- [x] VFS private folder system
- [x] Auto-balanced upload
- [x] File preview/streaming (PDF/image/video)
- [x] Storage stats dashboard
- [x] Responsive UI (desktop + mobile)
- [x] Secure token management

### 🔄 Future Enhancements
- [ ] File sharing (public links)
- [ ] File versioning
- [ ] Global search
- [ ] S3-compatible API
- [ ] Multi-cloud support (Dropbox, OneDrive)
- [ ] Client-side encryption

---

## 📞 Support

**Documentation:**
- `ARCHITECTURE.md` - System architecture
- `phase2e_walkthrough.md` - Latest implementation details
- `vfs_task.md` - Task tracking

**Git Repository:**
```bash
git log --oneline -10  # Recent commits
```

---

## 🎉 Summary

TirtaCloud adalah **private virtual filesystem** yang:
1. Mengintegrasikan multiple Google Drive accounts
2. Hanya menampilkan file yang diupload melalui sistem
3. Auto-balancing upload ke akun dengan space terbesar
4. File preview/streaming langsung di browser
5. Secure authentication dengan logout aman
6. Responsive UI untuk desktop dan mobile

**Konsep Kunci:** VFS = Upload-Only, bukan mirror Google Drive!
