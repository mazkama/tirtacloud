# TirtaCloud Setup Guide for aaPanel

## 1. PHP Configuration (Backend)
The Laravel backend requires specific PHP extensions. The installation showed a warning about `fileinfo` being missing.

**Action Required:**
1.  Open **aaPanel App Store**.
2.  Find **PHP 8.3** (or the version you are using, e.g., 8.2/8.1 if 8.3 isn't available). 
    *Note: The current system is running PHP 8.3.*
3.  Click **Setting** > **Install Extensions**.
4.  Install **fileinfo** extension.
5.  Install **redis** extension (optional but recommended for caching).
6.  Once installed, restart the PHP service.

## 2. Web Server Configuration (Nginx)
To serve both the Next.js Frontend and Laravel Backend on the same domain, we need to configure a Reverse Proxy or specific Nginx rules.

**Option A: Subdomain for API (Recommended for Stability)**
- `tirtacloud.mazkama.web.id` -> Points to Next.js (Port 3000)
- `api.tirtacloud.mazkama.web.id` -> Points to `/www/wwwroot/tirtacloud.mazkama.web.id/backend/public`

**Option B: Subdirectory for API (Single Domain)**
If you want everything on one domain:
1.  Go to **Website** > **tirtacloud.mazkama.web.id** > **Config**.
2.  Add a location block for the API:
    ```nginx
    location /api {
        alias /www/wwwroot/tirtacloud.mazkama.web.id/backend/public;
        try_files $uri $uri/ @laravel;
        
        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/tmp/php-cgi-83.sock; # Adjust version if needed
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }

    location @laravel {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }
    ```

## 3. Node.js (Frontend)
1.  Open **Website** > **Node Project** (if available) or use **PM2 Manager**.
2.  Add Project:
    - **Run Directory**: `/www/wwwroot/tirtacloud.mazkama.web.id/frontend`
    - **Startup Script**: `npm run start` (You must run `npm run build` first!)
    - **Port**: `3000`
3.  Map the domain `tirtacloud.mazkama.web.id` to `127.0.0.1:3000`.

## 4. Database (MySQL)
1.  Go to **Databases**.
2.  Create a new database (e.g., `tirtacloud`).
3.  Update the `.env` file in `/backend` with the credentials.
