# Growstro Manual Quality Assurance (QA) Script

This document provides a step-by-step Quality Assurance (QA) script to manually verify all system capabilities.

---

## 🔑 1. Authentication Flows

### A. Business Registration
1.  Navigate to `http://localhost:5173/register`
2.  Input unique business data (e.g. name: `Patan Cafe`, email: `owner@patan.test`, password: `password123`) and submit.
3.  **Expected Outcome**: System successfully provisions database schema and routes you to the tenant dashboard workspace: `http://localhost:5173/app/patan-cafe-.../dashboard` with a success toast.

### B. Tenant Owner Login
1.  Navigate to `http://localhost:5173/login`
2.  Input your tenant owner email and password. Select/enter the tenant slug.
3.  **Expected Outcome**: Access granted, Sanctum token stored, and client redirects to `/app/{tenantSlug}/dashboard` with a Nepal-scopable edition banner visible.

### C. Super Admin Central Login
1.  Navigate to `http://localhost:5173/login`
2.  Input central admin credentials: `admin-super@growstro.test` / `password123`. Leave tenant field blank.
3.  **Expected Outcome**: User session maps centrally, and client forwards user to `http://localhost:5173/admin/dashboard` automatically.

---

## 🍽️ 2. Tenant Workspace Operations

Log in as a Tenant Owner to verify these features:

### A. Customers Registry
1.  Navigate to Sidebar -> **Customers**.
2.  Click **Add Customer** and input name and phone number. Submit.
3.  **Expected Outcome**: Customer appears instantly in the customer list table.

### B. Products & Menu Management
1.  Navigate to Sidebar -> **Products** / **Menu Items**.
2.  Click **Add Menu Item**, input standard details (e.g. name: "Momo", price: 150), and submit.
3.  **Expected Outcome**: The Momo item appears in the product inventory list.

### C. Tables & Dine-in Layout
1.  Navigate to Sidebar -> **Spaces / Tables**.
2.  Click **Add Table**, set Table Name: `T5`, Capacity: `4`, and submit.
3.  **Expected Outcome**: Table T5 is added as `available` in the dine-in registry view.

### D. POS Ordering & Kitchen Ticket (KOT)
1.  Navigate to Sidebar -> **POS / Orders**.
2.  Select Table `T5` and click **New Order**. Add `2 Chicken Momo` to order card and click **Send to Kitchen (KOT)**.
3.  **Expected Outcome**: Status changes to `cooking` and a simulated KOT printing confirmation toast displays.

### E. Invoicing & eSewa Wallet Checkout
1.  Select active order Table `T5` and click **Generate Invoice**.
2.  Confirm tax rates and discount amount, then click **Generate Receipt**.
3.  Click **Initiate eSewa Sandbox Pay**.
4.  **Expected Outcome**: User is safely redirected to the eSewa Sandbox portal. Enter test number `9806800001` and PIN `1234` to authorize the mock checkout. Upon verification, status resolves to `paid`.

### F. Reports & WhatsApp Automation
1.  Navigate to Sidebar -> **WhatsApp Settings**. Enable the notification channel and enter a test WhatsApp number. Save.
2.  Navigate to Sidebar -> **Daily Reports**. Click **Generate Report** for the current date.
3.  Click **Send WhatsApp Summary**.
4.  **Expected Outcome**: Daily sales, transactions, expenses, and top menu items are computed. Toast alerts confirm successful dispatch or secure sandbox logging.

### G. Staff Invites & RBAC
1.  Navigate to Sidebar -> **Staff Management**. Click **Invite Staff**.
2.  Input email and select role: `staff` with `manage_orders` checked. Submit.
3.  **Expected Outcome**: An invitation token link is displayed. Open the link in an incognito window, create credentials, and log in. Verify the invited staff can process orders but is strictly blocked from workspace settings!

---

## 👑 3. Central Platform Controls

Log in as the **Super Admin** to verify these features:

### A. Central Dashboard
1.  Navigate to `http://localhost:5173/admin/dashboard`
2.  **Expected Outcome**: The central KPI dashboard loads metrics (total platform revenue, total registered tenants, subscription conversions).

### B. Tenant Account Lifecycles (Block / Restore)
1.  Navigate to Admin Sidebar -> **Tenants**.
2.  Select a tenant from the list and click **Suspend**.
3.  Open an incognito window and try logging into the suspended tenant workspace.
4.  **Expected Outcome**: Portal blocks login and renders: `This business account has been suspended`.
5.  Return to Super Admin window and click **Activate / Restore**. Confirm the tenant can successfully log back in.

### C. Plan & Subscription Adjustments
1.  Navigate to Admin Sidebar -> **Subscription Plans**.
2.  Select an active tenant and upgrade their plan from `Basic` to `Enterprise`.
3.  **Expected Outcome**: Tenant subscription status adjusts to `active` under the new tier instantly.
