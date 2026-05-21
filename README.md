# 🇳🇵 Growstro - Premium Multi-Tenant SaaS Restaurant Engine

Growstro is a premium multi-tenant Software-as-a-Service (SaaS) platform built specifically for small businesses and restaurants in Nepal. It enables instant tenant registration, automated PostgreSQL schema-level partitioning, unified auth routers, local eSewa Nepali gateway integration, automated WhatsApp report dispatch queues, and advanced staff Role-Based Access Controls (RBAC).

---

## 📚 Documentation Reference

For in-depth integration, deployment, and testing instructions, refer to the following documentation files:
*   📖 **API Specification Reference**: [docs/API.md](file:///c:/xampp/htdocs/restaurant/docs/API.md)
*   🚀 **Production Deployment Guide**: [docs/DEPLOYMENT.md](file:///c:/xampp/htdocs/restaurant/docs/DEPLOYMENT.md)
*   🔒 **Production Launch Checklist**: [docs/PRODUCTION_CHECKLIST.md](file:///c:/xampp/htdocs/restaurant/docs/PRODUCTION_CHECKLIST.md)
*   🧪 **Manual Quality Assurance (QA) Script**: [docs/MANUAL_QA.md](file:///c:/xampp/htdocs/restaurant/docs/MANUAL_QA.md)
*   🛣️ **System Route Catalog**: [docs/ROUTES.md](file:///c:/xampp/htdocs/restaurant/docs/ROUTES.md)

---

## 🛠️ 1. Technology Stack

*   **Backend Core**: Laravel 11 framework optimized for high-performance REST APIs.
*   **Authentication & Security**: Laravel Sanctum for isolated, token-based session handling.
*   **Multitenancy Partitioning**: `stancl/tenancy` engine configured exclusively for secure database and schema partitioning.
*   **Database Management**: PostgreSQL (central database + dynamic isolated tenant databases).
*   **Frontend Client**: React 19 + Vite single-page application (SPA).
*   **Design & Styling**: Vanilla CSS + PostCSS Tailwind CSS v3 featuring a premium glassmorphic dark developer aesthetic.
*   **Background Jobs & Schedulers**: Redis or PostgreSQL-backed database queue workers for job dispatches, and the standard Laravel console command scheduler.

---

## 🚀 2. Features Completed (Phases 1–12)

*   **Phase 1-2: Core SaaS Multitenancy**: Dynamic tenant provisioning, subdomain bindings, and schema resolution.
*   **Phase 3-4: Unified Core Authentication**: Centralized registration, logins, and dynamic tenant path redirection (`/app/{tenant}/...`).
*   **Phase 5-6: Menu & Order Management**: Advanced Point-of-Sale (POS) interfaces, digital table mappings, and dynamic Dine-In/Takeaway orders.
*   **Phase 7-8: KOT & Billing Engine**: Kitchen Order Tickets (KOT), tax compliance, and automated restaurant invoice generation.
*   **Phase 9-10: WhatsApp Automation & eSewa Integration**: Scheduled daily report dispatches via Meta WhatsApp Cloud API and eSewa local gateway processing.
*   **Phase 11-12: Advanced RBAC & Staff Invites**: Fine-grained role permissions, secure email/phone token-based invitations, and path-prefix frontend routing scopes.

---

## 📋 3. System Requirements

Ensure the target system meets these prerequisites:
*   **PHP**: Version `8.3` or greater (configured with `PDO_PGSQL` extension enabled)
*   **Composer**: Dependency Manager for PHP
*   **PostgreSQL**: Database engine running locally or remotely (port `5432`)
*   **Node.js**: Version `18.x` or `20.x` (LTS)
*   **NPM**: Version `10.x` or greater

---

## ⚙️ 4. Backend Setup & Run Guide (`/backend`)

Follow these steps to initialize the API server:

1.  **Navigate and Install Dependencies**:
    ```bash
    cd backend
    C:\xampp\php83\php.exe C:\xampp\php83\composer.phar install
    ```
2.  **Establish Environment Settings**:
    Copy the example template:
    ```bash
    copy .env.example .env
    ```
    Open `.env` and verify your PostgreSQL connection credentials:
    ```env
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=growstro_central
    DB_USERNAME=postgres
    DB_PASSWORD=your_postgres_password
    ```
3.  **Generate Secure Application Key**:
    ```bash
    C:\xampp\php83\php.exe artisan key:generate
    ```
4.  **Run Fresh Central Migrations**:
    Prepare the central database structures:
    ```bash
    C:\xampp\php83\php.exe artisan migrate:fresh
    ```
5.  **Seed the Core Database**:
    Seed default plans, super administrator credentials, and demo mock accounts:
    ```bash
    C:\xampp\php83\php.exe artisan db:seed
    ```
6.  **Launch the Backend API Server**:
    Serve the backend on port `8000`:
    ```bash
    C:\xampp\php83\php.exe artisan serve --port=8000
    ```

---

## 🎨 5. Frontend Setup & Run Guide (`/frontend`)

Initialize the React client using these commands:

1.  **Navigate and Install Packages**:
    ```bash
    cd frontend
    cmd /c npm install
    ```
2.  **Environment Settings**:
    Copy the environment template:
    ```bash
    copy .env.example .env
    ```
    Ensure the keys target the correct local API port:
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    VITE_APP_NAME=Growstro
    ```
3.  **Start Client in Development Mode**:
    ```bash
    cmd /c npm run dev
    ```
    This serves the client locally at `http://localhost:5173/`.
4.  **Compile Production Package**:
    Compile and minify React code into static assets under the `dist/` directory:
    ```bash
    cmd /c npm run build
    ```

---

## 🔄 6. Background Queue Workers

Growstro utilizes background jobs for heavy computations (such as WhatsApp template delivery, Daily Report generation, and invite dispatching):

*   **Local queue execution**:
    ```bash
    C:\xampp\php83\php.exe artisan queue:work
    ```
*   **Production recommendation**: Configure a Process Monitor like **Supervisor** to ensure `queue:work` runs perpetually in the background and restarts automatically on crash.

---

## 📅 7. Task Scheduler Setup

Automated daily reports and token expirations consume the Laravel Scheduler:

*   **Local testing trigger**:
    ```bash
    C:\xampp\php83\php.exe artisan schedule:run
    ```
*   **Production Cron config**: Append this line to your server's crontab (`crontab -e`) to execute the scheduler every minute:
    ```cron
    * * * * * cd /var/www/growstro/backend && php artisan schedule:run >> /dev/null 2>&1
    ```

---

## 🔑 8. Default Login Credentials (Demo)

These pre-configured demo credentials are provisioned during `db:seed`:

### A. Super Administrator (Central Dashboard)
*   **Email**: `admin-central@growstro.test`
*   **Password**: `GrowstroSuperSecure2026!`

### B. Demo Tenant Owner (Workspace Dashboard)
*   **Tenant Slug**: `sajilo`
*   **Email**: `owner-sajilo@growstro.test`
*   **Password**: `SajiloStoreOwner2026!`
*   **Workspace Portal**: `http://localhost:5173/app/sajilo/dashboard`

> [!WARNING]
> These demo credentials are strictly for sandbox/local verification. **Always disable seeders or modify default passwords prior to production deployment!**

---

## 💳 9. eSewa Sandbox Integration

Growstro supports native, one-click payment processing via eSewa (Nepal's leading wallet):

1.  **Sandbox Credentials**: Standard local config falls back to public test merchant ID:
    ```env
    ESEWA_MERCHANT_ID=EPAYTEST
    ESEWA_SECRET_KEY=8g8M8t3H8McZ'7
    ESEWA_MODE=sandbox
    ```
2.  **Customer Wallets for Testing**: Use eSewa standard developer sandbox credentials for wallet checkout:
    *   **Test Wallet ID/Phone**: `9806800001` or `9806800002`
    *   **Test OTP / MPIN**: `1234`

---

## 💬 10. WhatsApp Business API Setup

Scheduled daily summaries are delivered via Meta's WhatsApp Cloud API:

1.  **Production Credentials**: In `.env`, populate the Meta credentials:
    ```env
    WHATSAPP_API_URL=https://graph.facebook.com/v19.0
    WHATSAPP_PHONE_NUMBER_ID=your_facebook_phone_number_id
    WHATSAPP_ACCESS_TOKEN=your_system_user_access_token
    WHATSAPP_TEMPLATE_NAME=daily_report_summary
    WHATSAPP_DEFAULT_COUNTRY_CODE=977
    ```
2.  **Sandbox Failsafe**: If these `.env` variables are left blank, the WhatsApp module automatically enters sandbox safe-mode, logging all templates locally into Laravel logs without throwing connection errors or blocking checkouts.

---

## 💾 11. PostgreSQL Tenant Databases

Growstro utilizes Stancl Tenancy with **separate PostgreSQL databases** to maintain absolute isolation:

*   Central Registry data (tenant accounts, subscription plans, platform logs) resides in `growstro_central`.
*   Each tenant workspace resides in its own isolated PostgreSQL database named `tenant<uuid_or_slug>` (e.g. `tenantdemo`).
*   **Dynamic Migrations**: Tenant tables are created dynamically at tenant registration using migrations located in `database/migrations/tenant`.

---

## 🧪 12. Running Regression Tests

Run the complete test suite to ensure the system is 100% stable:

```bash
cd backend
C:\xampp\php83\php.exe vendor\phpunit\phpunit\phpunit
```
Or run artisan's wrapper command:
```bash
C:\xampp\php83\php.exe artisan test
```

---

## 🔧 13. Common Troubleshooting

### 1. PostgreSQL Connection Refused
*   *Cause*: The Postgres server is offline or is running on a port other than `5432`.
*   *Solution*: Ensure the service is active in your System Services control panel or run `pg_ctl -D "C:\Program Files\PostgreSQL\...\data" start`.

### 2. PHP Version Mismatch
*   *Cause*: Running Composer with system path set to PHP 8.0 or 8.1.
*   *Solution*: Prefix commands explicitly with the newer PHP 8.3 binary: `C:\xampp\php83\php.exe C:\xampp\php83\composer.phar install`.

### 3. Tenant Database Already Exists
*   *Cause*: Leftover schema on PostgreSQL from a previously deleted test tenant.
*   *Solution*: Log into your PostgreSQL client (`psql -U postgres`) and run `DROP DATABASE tenant<tenantSlug>;` manually.

### 4. Queue Jobs Not Processing
*   *Cause*: The background worker is stopped.
*   *Solution*: Run `php artisan queue:work` or verify the status of the Supervisor daemon.

---

## 🔒 14. Security Hardening & Launch Guidelines

*   **Production Environment**: Set `APP_ENV=production` and `APP_DEBUG=false` in the backend `.env`.
*   **SSL/HTTPS Requirements**: Enforce strict HTTPS bindings in Nginx to safeguard user request headers and Sanctum bearer tokens.
*   **Secret Keys Isolation**: Never commit active API keys, passwords, or secret files to Git repository trees. Manage them exclusively using server-level `.env` values.
*   **Backup Policies**: Establish a crontab task executing `pg_dump` daily to back up `growstro_central` and all dynamic tenant databases.
