# TirtaCloud Architecture

## System Overview

```mermaid
graph TD
    User[End User] -->|HTTPS| Frontend[Next.js Frontend]
    
    subgraph "Server (aaPanel)"
        Frontend -->|API Requests| Backend[Laravel Backend]
        Backend -->|Query| DB[(MySQL Database)]
        Backend -->|Auth| Google[Google OAuth]
        Backend -->|File API| GDrive[Google Drive API]
    end

    subgraph "Database Schema"
        DB --> Users[Users Table]
        DB --> Accounts[User Cloud Accounts]
        DB --> Files[Files Table (Virtual FS)]
    end
```

## Data Flow
1.  **Auth**: User logs in via Next.js -> Laravel Sanctum issues Token.
2.  **Drive Link**: User initiates OAuth -> Laravel handles Callback -> Stores Token in `user_cloud_accounts`.
3.  **File List**: Frontend requests `/api/drive/files` -> Laravel uses stored Token -> Fetches from Google Drive API -> Returns JSON.

## Technology Stack
-   **Frontend**: Next.js 14, Tailwind CSS, Shadcn/UI, Axios.
-   **Backend**: Laravel 10, Sanctum, Google API Client.
-   **Database**: MySQL.
-   **Infrastructure**: Ubuntu, Nginx, PM2 (Node), PHP-FPM 8.3.
