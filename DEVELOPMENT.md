# Development Guide - TirtaCloud

## Project Architecture

### Backend (Laravel 10)
- **Location**: `/backend`
- **Role**: API Server, Authentication Provider, Job Queue Manager.
- **Key Services**:
  - `GoogleDriveService`: Handles all interactions with Google Drive API v3.
  - `Sanctum`: Handles API Token authentication.
- **Database**: MySQL (`users`, `user_cloud_accounts`, `files`).
- **API Endpoints**:
  - `GET /api/drive/auth-url`: Init OAuth.
  - `POST /api/drive/callback`: Handle OAuth.
  - `GET /api/drive/files`: List files.
  - `POST /api/drive/upload`: Upload file (multipart/form-data key `file`).
  - `DELETE /api/drive/files/{id}`: Delete file.
  - `GET /api/drive/files/{id}/download`: Get download URL.

### Frontend (Next.js 14)
- **Location**: `/frontend`
- **Role**: SPA / Client-side Interface.
- **Key Concepts**:
  - **App Router**: Uses `app/` directory for routing.
  - **Axios Interceptor**: Automatically attaches Bearer token to requests.
  - **Shadcn/UI**: Component library (Radix UI + Tailwind).

## Continuation Guide (Next Steps)

### Phase 2: Multi-Cloud & File Operations
1.  **Orchestration**: Implement file upload/download Logic using `GoogleDriveService`.
    - *Current State*: Controller has methods, but backend logic needs stream handling.
2.  **Virtual Filesystem**: Implement logic to create "virtual folders" in the `files` table that don't exist in the cloud, allowing organization across accounts.
3.  **Additional Providers**: Add `DropboxService` following the `GoogleDriveService` pattern.
4.  **Frontend Polish**: Add Toasts for success/error messages, implementation of File Upload UI.

## Deployment Notes (aaPanel)
- Map `/api` in Nginx to the Laravel `public` folder.

## Development Environment Ports
To ensure consistency with the Zero Trust production environment, please use the following ports for local development:

-   **Backend**: `http://localhost:2605`
    -   Command: `php artisan serve --port=2605`
-   **Frontend**: `http://localhost:2606`
    -   Command: `npm run dev` (Port configured in package.json)
