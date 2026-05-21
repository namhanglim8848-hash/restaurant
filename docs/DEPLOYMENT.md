# Growstro Production Deployment Guide

This guide details the recommended procedures for deploying the **Growstro SaaS Application** in a secure, performant production environment.

---

## 💻 1. Recommended Production Stack

*   **Operating System**: Ubuntu 22.04 LTS or newer
*   **Web Server**: Nginx (reverse proxy, static asset server, and SSL termination)
*   **Process Manager**: PHP 8.3-FPM
*   **Database Service**: PostgreSQL 16
*   **Background Runner**: Supervisor (managing `queue:work` workers)
*   **Task Automater**: System Crontab (scheduler execution)
*   **Memory Store (Optional)**: Redis (highly recommended for queue storage and session speed)

---

## 💾 2. PostgreSQL Server Provisioning

1.  **Install PostgreSQL**:
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```
2.  **Access client and establish user credentials**:
    ```bash
    sudo -i -u postgres psql
    ```
    ```sql
    CREATE DATABASE growstro_central;
    CREATE USER growstro_admin WITH PASSWORD 'secure_production_password_here';
    GRANT ALL PRIVILEGES ON DATABASE growstro_central TO growstro_admin;
    \q
    ```
3.  **Adjust DB Permissions for Tenancy**:
    Since Stancl Tenancy dynamically spawns database schemas on PostgreSQL, ensure that the `growstro_admin` role possesses `CREATEDB` permissions to dynamically provision isolated workspaces:
    ```sql
    ALTER USER growstro_admin CREATEDB;
    ```

---

## 🚀 3. Laravel Backend Installation (`/backend`)

1.  **Configure directory structure**:
    Clone the codebase to `/var/www/growstro` and navigate to the backend folder:
    ```bash
    cd /var/www/growstro/backend
    ```
2.  **Install dependencies in production mode**:
    ```bash
    composer install --no-dev --optimize-autoloader
    ```
3.  **Provision production environment**:
    Copy environment template and configure production settings:
    ```bash
    cp .env.example .env
    ```
    Configure the production values:
    ```env
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://growstro.com
    
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=growstro_central
    DB_USERNAME=growstro_admin
    DB_PASSWORD=secure_production_password_here
    
    QUEUE_CONNECTION=database
    SESSION_DRIVER=database
    ```
4.  **Application key generation**:
    ```bash
    php artisan key:generate
    ```
5.  **Provision Storage Symlink**:
    Link Laravel public folder to system upload directories:
    ```bash
    php artisan storage:link
    ```
6.  **Set Directory Owner and Permissions**:
    Ensure the `www-data` web server group owns writable folders:
    ```bash
    sudo chown -R www-data:www-data /var/www/growstro/backend/storage
    sudo chown -R www-data:www-data /var/www/growstro/backend/bootstrap/cache
    sudo chmod -R 775 /var/www/growstro/backend/storage
    sudo chmod -R 775 /var/www/growstro/backend/bootstrap/cache
    ```

---

## 🎨 4. React Frontend Compilation & Deployment

1.  **Install packages and compile in release mode**:
    ```bash
    cd /var/www/growstro/frontend
    npm install
    npm run build
    ```
2.  The build output resides in `/var/www/growstro/frontend/dist` which will be directly bound to Nginx for lightning-fast delivery of static client assets.

---

## 🌐 5. Nginx Configuration (Unified Domains & Subdomains)

Create a server configuration at `/etc/nginx/sites-available/growstro`:

```nginx
server {
    listen 80;
    server_name growstro.com *.growstro.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name growstro.com *.growstro.com;

    # SSL Config (managed by Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/growstro.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/growstro.com/privkey.pem;

    root /var/www/growstro/frontend/dist;
    index index.html;

    # 1. API Route Requests
    location /api {
        alias /var/www/growstro/backend/public;
        try_files $uri $uri/ @api;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/growstro/backend/public/index.php;
            include fastcgi_params;
        }
    }

    location @api {
        rewrite /api/(.*)$ /index.php?/$1 last;
    }

    # 2. Frontend Application Requests
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Logs
    access_log /var/log/nginx/growstro_access.log;
    error_log /var/log/nginx/growstro_error.log;
}
```

Enable site configuration and restart:
```bash
sudo ln -s /etc/nginx/sites-available/growstro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 6. Supervisor Queue Management

Create a daemon supervisor configuration at `/etc/supervisor/conf.d/growstro-worker.conf`:

```ini
[program:growstro-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/growstro/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/growstro/backend/storage/logs/queue.log
stopasgroup=true
killasgroup=true
```

Reload and activate Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

---

## 💾 7. Automatic Database Backup Strategy

Create a shell backup script `/home/ubuntu/backups/db_backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups/data"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
PGPASSWORD="secure_production_password_here" pg_dump -U growstro_admin -h 127.0.0.1 -F c -b -v -f "$BACKUP_DIR/central_$DATE.backup" growstro_central

# Backup all dynamic schemas
# (Since Postgres separates dynamic tenants as physical databases, use pg_dumpall or loop through dynamic databases)
PGPASSWORD="secure_production_password_here" psql -U growstro_admin -h 127.0.0.1 -d growstro_central -t -A -c "SELECT id FROM tenants" | while read -r tenant_id; do
    db_name="tenant$tenant_id"
    PGPASSWORD="secure_production_password_here" pg_dump -U growstro_admin -h 127.0.0.1 -F c -b -v -f "$BACKUP_DIR/${db_name}_$DATE.backup" "$db_name"
done

# Keep only last 14 days
find "$BACKUP_DIR" -type f -mtime +14 -delete
```
Bind to system crontab to execute every midnight!
