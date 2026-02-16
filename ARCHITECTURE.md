# TirtaCloud Architecture Documentation

## System Overview

TirtaCloud is a **multi-cloud virtual filesystem** that unifies multiple Google Drive accounts into a single virtual filesystem, enabling users to manage files across accounts seamlessly with automatic upload balancing and comprehensive storage tracking.

---

## Technology Stack

### Backend
- **Framework:** Laravel 11.x (PHP 8.2+)
- **Database:** MySQL 8.0
- **Authentication:** Laravel Sanctum (Token-based)
- **Queue:** Laravel Queue (Database driver)
- **Cloud Integration:** Google Drive API v3

### Frontend
- **Framework:** Next.js 16.x (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI (Radix UI)
- **State Management:** React Context API
- **HTTP Client:** Axios

### Infrastructure
- **Web Server:** Nginx
- **Process Manager:** PM2 (for Next.js)
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt / Cloudflare

---

## Database Schema

### Core Tables

#### `users`
```sql
id              BIGINT PRIMARY KEY
name            VARCHAR(255)
email           VARCHAR(255) UNIQUE
password        VARCHAR(255)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `user_cloud_accounts`
```sql
id              BIGINT PRIMARY KEY
user_id         BIGINT FOREIGN KEY → users.id
provider        VARCHAR(50)  -- 'google_drive'
email           VARCHAR(255)
name            VARCHAR(255)
access_token    TEXT (encrypted)
refresh_token   TEXT (encrypted)
expires_at      TIMESTAMP
total_storage   BIGINT       -- bytes
used_storage    BIGINT       -- bytes
is_active       BOOLEAN DEFAULT true
metadata        JSON
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `virtual_files`
```sql
id                  BIGINT PRIMARY KEY
user_id             BIGINT FOREIGN KEY → users.id
virtual_path        VARCHAR(512)     -- e.g., /Documents/Report.pdf
parent_virtual_id   BIGINT FOREIGN KEY → virtual_files.id (nullable)
cloud_account_id    BIGINT FOREIGN KEY → user_cloud_accounts.id
name                VARCHAR(255)
mime_type           VARCHAR(255)
is_folder           BOOLEAN DEFAULT false
size                BIGINT           -- bytes
cloud_file_id       VARCHAR(255)     -- Original Google Drive file ID
metadata            JSON
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user (user_id)
INDEX idx_user_parent (user_id, parent_virtual_id)
```

---

## Backend Architecture

### Service Layer

#### VirtualFilesystemService
**Responsibilities:** List files, create entries, navigate folders, delete files, sync from Google Drive

#### UploadBalancerService
**Responsibilities:** Select account with most free space, update storage usage

**Algorithm:** Get active accounts → Filter by free space → Sort by available DESC → Return best

#### StorageStatsService
**Responsibilities:** Calculate aggregated stats, per-account breakdown, file/folder counts

#### GoogleDriveService
**Responsibilities:** Google Drive API integration, file upload/download, token refresh

---

## Frontend Architecture

### Directory Structure
```
frontend/
├── app/
│   ├── layout.tsx                  # Root layout with AuthProvider
│   ├── dashboard/
│       ├── layout.tsx              # Dashboard with sidebar
│       ├── files/page.tsx          # VFS file browser
│       ├── storage/page.tsx        # Storage dashboard
│       └── accounts/page.tsx       # Google Drive accounts
├── components/ui/                  # Shadcn/UI components
├── hooks/useAuth.tsx               # Authentication hook
└── lib/axios.ts                    # Axios with interceptors
```

### State Management

#### AuthContext
- `user: User | null`
- `loading: boolean`
- `login()`, `register()`, `logout()`, `refreshUser()`

---

## API Endpoints

### Authentication
```
POST /api/register
POST /api/login
POST /api/logout
GET  /api/user
```

### Virtual Filesystem
```
GET    /api/vfs/files?path={path}
POST   /api/vfs/upload
GET    /api/vfs/download/{id}
DELETE /api/vfs/files/{id}
POST   /api/vfs/sync
POST   /api/vfs/create-folder
```

### Storage
```
GET /api/storage/stats
GET /api/storage/accounts
```

---

## Data Flow Diagrams

### VFS File Listing
```
User → FileBrowser → GET /vfs/files?path=/Documents
→ VFS Service → Query virtual_files WHERE user_id AND path LIKE '/Documents%'
→ Return files → Display in UI
```

### Upload with Balancing
```
User selects file → POST /vfs/upload
→ UploadBalancer selects account with most space
→ Upload to Google Drive → Create virtual_files entry
→ Update used_storage → Return success
```

### Logout
```
User clicks Logout → POST /api/logout
→ Revoke token in DB → Clear localStorage
→ Clear auth context → Redirect to /
```

---

## Security

- **Authentication:** Laravel Sanctum token-based
- **Cloud Tokens:** Encrypted access_token and refresh_token
- **API Security:** `auth:sanctum` middleware, CORS, rate limiting

---

## Deployment

```
Cloudflare/SSL → Nginx (Reverse Proxy)
  ├─ Frontend (Next.js:3000)
  └─ Backend (Laravel:2605)
       └─ MySQL (3306)
```

---

## Summary

TirtaCloud unifies multiple Google Drive accounts into a single virtual filesystem with:
- Automatic upload balancing
- Real-time storage tracking
- Secure token-based authentication
- Responsive SPA frontend
- Service-oriented backend architecture
