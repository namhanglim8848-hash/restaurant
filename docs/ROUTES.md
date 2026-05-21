# Growstro System Route Catalog

This document contains a structured directory of all live routing patterns registered in the **Growstro** API engine, compiled dynamically from the routing tables.

---

## 👑 1. Central Registration & Auth Routes

These routes reside under the central domain, serving guest registrants, platform discovery, and token generation:

| Method | URI Path | Action Controller / Closure | Middleware |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-business` | `Api\Auth\RegisterBusinessController` | `api` (Guest) |
| `POST` | `/api/auth/login` | `Api\Auth\UnifiedLoginController` | `api` (Guest) |
| `POST` | `/api/auth/logout` | `Api\Auth\UnifiedLoginController@logout` | `api`, `auth:sanctum` |
| `GET` | `/api/auth/me` | `Api\Auth\UnifiedLoginController@me` | `api`, `auth:sanctum` |
| `GET` | `/api/health` | `Closure` (Health check heartbeat) | `api` (Public) |
| `GET` | `/up` | `Closure` (Laravel health check) | Public |

---

## 🏬 2. Tenant Scoped Workspace Routes

All workspace endpoints are dynamic path-prefixed with `api/{tenant}/`. They pass through tenant validation and role token resolvers:

### A. Customers & Profiles
*   `GET` | `/api/{tenant}/customers` $\rightarrow$ `Api\CustomerController@index`
*   `POST` | `/api/{tenant}/customers` $\rightarrow$ `Api\CustomerController@store`
*   `GET` | `/api/{tenant}/customers/{customer}` $\rightarrow$ `Api\CustomerController@show`
*   `PUT/PATCH` | `/api/{tenant}/customers/{customer}` $\rightarrow$ `Api\CustomerController@update`
*   `DELETE` | `/api/{tenant}/customers/{customer}` $\rightarrow$ `Api\CustomerController@destroy`

### B. Products & Inventory
*   `GET` | `/api/{tenant}/products` $\rightarrow$ `Api\ProductController@index`
*   `POST` | `/api/{tenant}/products` $\rightarrow$ `Api\ProductController@store`
*   `GET` | `/api/{tenant}/products/{product}` $\rightarrow$ `Api\ProductController@show`
*   `PUT/PATCH` | `/api/{tenant}/products/{product}` $\rightarrow$ `Api\ProductController@update`
*   `DELETE` | `/api/{tenant}/products/{product}` $\rightarrow$ `Api\ProductController@destroy`

### C. Restaurant Dine-In Spaces & Tables
*   `GET` | `/api/{tenant}/spaces` $\rightarrow$ `Api\RestaurantSpaceController@index`
*   `POST` | `/api/{tenant}/spaces` $\rightarrow$ `Api\RestaurantSpaceController@store`
*   `GET` | `/api/{tenant}/spaces/{space}` $\rightarrow$ `Api\RestaurantSpaceController@show`
*   `PUT/PATCH` | `/api/{tenant}/spaces/{space}` $\rightarrow$ `Api\RestaurantSpaceController@update`
*   `DELETE` | `/api/{tenant}/spaces/{space}` $\rightarrow$ `Api\RestaurantSpaceController@destroy`
*   `GET` | `/api/{tenant}/tables` $\rightarrow$ `Api\RestaurantTableController@index`
*   `POST` | `/api/{tenant}/tables` $\rightarrow$ `Api\RestaurantTableController@store`
*   `GET` | `/api/{tenant}/tables/{table}` $\rightarrow$ `Api\RestaurantTableController@show`
*   `PUT/PATCH` | `/api/{tenant}/tables/{table}` $\rightarrow$ `Api\RestaurantTableController@update`
*   `DELETE` | `/api/{tenant}/tables/{table}` $\rightarrow$ `Api\RestaurantTableController@destroy`

### D. Orders & Kitchen Tickets (KOT)
*   `GET` | `/api/{tenant}/orders` $\rightarrow$ `Api\OrderController@index`
*   `POST` | `/api/{tenant}/orders` $\rightarrow$ `Api\OrderController@store`
*   `GET` | `/api/{tenant}/orders/{order}` $\rightarrow$ `Api\OrderController@show`
*   `PUT/PATCH` | `/api/{tenant}/orders/{order}` $\rightarrow$ `Api\OrderController@update`
*   `POST` | `/api/{tenant}/orders/{id}/kot` $\rightarrow$ `Api\OrderController@generateKot`

### E. Invoices & eSewa Local Payments
*   `GET` | `/api/{tenant}/invoices` $\rightarrow$ `Api\InvoiceController@index`
*   `POST` | `/api/{tenant}/invoices` $\rightarrow$ `Api\InvoiceController@store`
*   `GET` | `/api/{tenant}/invoices/{invoice}` $\rightarrow$ `Api\InvoiceController@show`
*   `GET` | `/api/{tenant}/invoices/{id}/pdf` $\rightarrow$ `Api\InvoiceController@downloadPdf`
*   `POST` | `/api/{tenant}/payments/esewa/initiate` $\rightarrow$ `Api\EsewaPaymentController@initiate`
*   `POST` | `/api/{tenant}/payments/esewa/verify` $\rightarrow$ `Api\EsewaPaymentController@verify`
*   `GET` | `/api/{tenant}/payments/esewa/success` $\rightarrow$ `Api\EsewaPaymentController@esewaSuccess`
*   `GET` | `/api/{tenant}/payments/esewa/failure` $\rightarrow$ `Api\EsewaPaymentController@esewaFailure`

### F. Reports & WhatsApp Automations
*   `GET` | `/api/{tenant}/whatsapp-settings` $\rightarrow$ `Api\WhatsAppReportSettingController@show`
*   `PUT` | `/api/{tenant}/whatsapp-settings` $\rightarrow$ `Api\WhatsAppReportSettingController@update`
*   `GET` | `/api/{tenant}/daily-reports` $\rightarrow$ `Api\DailyReportController@index`
*   `POST` | `/api/{tenant}/daily-reports/generate` $\rightarrow$ `Api\DailyReportController@generate`
*   `POST` | `/api/{tenant}/daily-reports/{id}/send-whatsapp` $\rightarrow$ `Api\DailyReportController@sendWhatsApp`

### G. Staff Invitations & RBAC Controls
*   `GET` | `/api/{tenant}/staff` $\rightarrow$ `Api\StaffController@index`
*   `POST` | `/api/{tenant}/staff` $\rightarrow$ `Api\StaffController@store`
*   `GET` | `/api/{tenant}/staff/{id}` $\rightarrow$ `Api\StaffController@show`
*   `PUT` | `/api/{tenant}/staff/{id}` $\rightarrow$ `Api\StaffController@update`
*   `DELETE` | `/api/{tenant}/staff/{id}` $\rightarrow$ `Api\StaffController@destroy`
*   `PUT` | `/api/{tenant}/staff/{id}/activate` $\rightarrow$ `Api\StaffController@activate`
*   `PUT` | `/api/{tenant}/staff/{id}/deactivate` $\rightarrow$ `Api\StaffController@deactivate`
*   `PUT` | `/api/{tenant}/staff/{id}/permissions` $\rightarrow$ `Api\StaffController@updatePermissions`
*   `PUT` | `/api/{tenant}/staff/{id}/role` $\rightarrow$ `Api\StaffController@updateRole`
*   `GET` | `/api/{tenant}/staff-invitations` $\rightarrow$ `Api\StaffInvitationController@index`
*   `POST` | `/api/{tenant}/staff-invitations` $\rightarrow$ `Api\StaffInvitationController@store`
*   `DELETE` | `/api/{tenant}/staff-invitations/{id}` $\rightarrow$ `Api\StaffInvitationController@destroy`
*   `POST` | `/api/{tenant}/staff-invitations/{id}/resend` $\rightarrow$ `Api\StaffInvitationController@resend`

---

## 👑 3. Central Super Administrator Routes

These management endpoints are only accessible by authenticated users with the `super_admin` role:

| Method | URI Path | Action Controller / Closure | Middleware |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `Api\Admin\SuperAdminController@dashboard` | `api`, `auth:sanctum` |
| `GET` | `/api/admin/tenants` | `Api\Admin\SuperAdminController@listTenants` | `api`, `auth:sanctum` |
| `PUT` | `/api/admin/tenants/{id}/suspend` | `Api\Admin\SuperAdminController@suspendTenant` | `api`, `auth:sanctum` |
| `PUT` | `/api/admin/tenants/{id}/restore` | `Api\Admin\SuperAdminController@restoreTenant` | `api`, `auth:sanctum` |
| `GET` | `/api/admin/plans` | `Api\Admin\SuperAdminController@listPlans` | `api`, `auth:sanctum` |
| `PUT` | `/api/admin/tenants/{id}/plan` | `Api\Admin\SuperAdminController@updateTenantPlan` | `api`, `auth:sanctum` |
| `GET` | `/api/admin/audit-logs` | `Api\Admin\SuperAdminController@auditLogs` | `api`, `auth:sanctum` |
