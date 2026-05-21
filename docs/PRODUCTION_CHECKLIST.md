# Growstro Production Launch Checklist

This checklist must be fully reviewed and ticked off prior to designating any **Growstro** node as production-ready.

---

## 🔒 1. Environment & Security Configs

- [ ] **`APP_ENV=production`**: Set in backend `.env` to disable all developer debugging tools.
- [ ] **`APP_DEBUG=false`**: Set in backend `.env` to prevent verbose error traces from being exposed to the public.
- [ ] **`APP_KEY` Provisioned**: Generate a unique, cryptographically strong key: `php artisan key:generate`.
- [ ] **`CORS_ALLOWED_ORIGINS` & `SANCTUM_STATEFUL_DOMAINS`**: Bind exclusively to your production domain (e.g. `growstro.com, *.growstro.com`).
- [ ] **HTTPS / SSL Configuration**: Enforce Let's Encrypt TLS certificates. Direct port 80 traffic (HTTP) to port 443 (HTTPS) within Nginx.
- [ ] **Secure Database Connection**: Set a strong, custom password for `growstro_admin` role in PostgreSQL and keep port 5432 bound to localhost only (`127.0.0.1`).

---

## 💾 2. Data & Backup Configurations

- [ ] **Database Backups**: Configure a crontab schedule executing daily backup sweeps (`pg_dump` on `growstro_central` and dynamic tenant databases).
- [ ] **Tenant Isolation Audits**: Confirm that no two tenants can share access or cross-query other workspace database schemas.
- [ ] **Audit Trail Active**: Verify central and tenant-level audit tables are recording critical administration actions.

---

## 🔄 3. Process Daemons & Schedulers

- [ ] **Supervisor Daemon Running**: Verify Supervisor status (`sudo supervisorctl status`) shows both `queue:work` processes active and running without errors.
- [ ] **System Scheduler Cron Active**: Ensure system cron executes the scheduler once per minute: `* * * * * cd /var/www/growstro/backend && php artisan schedule:run >> /dev/null 2>&1`.
- [ ] **Redis/Database Queue Clean**: Flush any obsolete developer test queues: `php artisan queue:clear`.

---

## 💼 4. Third-Party API Credentials

- [ ] **Production eSewa Settings**:
    *   Set `ESEWA_MODE=production`.
    *   Set correct commercial `ESEWA_MERCHANT_ID` and production cryptographic keys.
    *   Set production return URL callback addresses.
- [ ] **Production WhatsApp Cloud API Credentials**:
    *   Set the Meta Business Phone Number ID.
    *   Set the permanent System User Access Token.
    *   Confirm the Meta-approved `daily_report_summary` template is configured.

---

## 📁 5. Directory Owners & Permissions

- [ ] **Writable Folders**: Verify `storage` and `bootstrap/cache` directories are owned by the web server process user (`www-data`) and permissions set to `775`.
- [ ] **Storage Link**: Confirm public uploads are symlinked: `php artisan storage:link`.

---

## 👥 6. Accounts & Credentials Hardening

- [ ] **Default Passwords Changed**: Update the initial Super Admin password from `password123` to a secure production secret.
- [ ] **Disable Demo Data**: Ensure `DemoTenantSeeder` and other demo seeds are disabled or purged from production run paths to prevent unauthorized access.
