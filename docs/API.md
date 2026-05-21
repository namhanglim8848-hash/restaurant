# Growstro API Specification Reference

This document provides a highly detailed reference for the **Growstro SaaS API** endpoints. All API requests must set the following headers:
*   `Accept: application/json`
*   `Content-Type: application/json`

---

## 🔑 1. Authentication (Central & Tenant)

### A. Register Business
*   **Endpoint**: `/api/auth/register-business`
*   **Method**: `POST`
*   **Auth Requirement**: None (Guest)
*   **Permissions**: Public
*   **Sample Request**:
    ```json
    {
      "business_name": "Sajilo Restaurant",
      "owner_name": "Ram Bahadur",
      "phone": "9841112223",
      "email": "ram@sajilo.test",
      "password": "securePassword123",
      "password_confirmation": "securePassword123",
      "address": "Kathmandu, Nepal",
      "business_type": "restaurant"
    }
    ```
*   **Sample Success Response (`201 Created`)**:
    ```json
    {
      "success": true,
      "message": "Business registered successfully and workspace provisioned.",
      "data": {
        "business": {
          "id": "sajilo-restaurant-3d4a",
          "name": "Sajilo Restaurant",
          "domain": "sajilo-restaurant-3d4a.localhost"
        },
        "owner": {
          "name": "Ram Bahadur",
          "email": "ram@sajilo.test",
          "role": "owner"
        },
        "access_token": "1|abCdeFG12345..."
      }
    }
    ```
*   **Sample Error Response (`422 Unprocessable Entity`)**:
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": {
        "email": ["The email has already been taken."]
      }
    }
    ```

### B. Unified Login
*   **Endpoint**: `/api/auth/login`
*   **Method**: `POST`
*   **Auth Requirement**: None (Guest)
*   **Permissions**: Public
*   **Sample Request**:
    ```json
    {
      "email": "ram@sajilo.test",
      "password": "securePassword123",
      "tenant": "sajilo-restaurant-3d4a"
    }
    ```
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": 1,
          "name": "Ram Bahadur",
          "email": "ram@sajilo.test",
          "role": "owner"
        },
        "access_token": "2|xyZ12345..."
      }
    }
    ```

---

## 🍽️ 2. Tenant Workspace Resources

All tenant endpoints are dynamically scoped via the path-prefix: `/api/{tenantSlug}/...`

### A. Customers CRUD

#### 1. List Customers
*   **Endpoint**: `/api/{tenantSlug}/customers`
*   **Method**: `GET`
*   **Auth Requirement**: Yes (Sanctum Bearer Token)
*   **Permissions**: `manage_customers` OR `owner` OR `manager`
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Customers retrieved successfully",
      "data": {
        "data": [
          {
            "id": 5,
            "name": "Hari Prasad",
            "phone": "9841999999",
            "email": "hari@customer.test",
            "due_amount": 1500.00
          }
        ]
      }
    }
    ```

#### 2. Create Customer
*   **Endpoint**: `/api/{tenantSlug}/customers`
*   **Method**: `POST`
*   **Auth Requirement**: Yes
*   **Sample Request**:
    ```json
    {
      "name": "Shyam Sundar",
      "phone": "9841888888",
      "email": "shyam@customer.test"
    }
    ```

### B. Products / Services / Menu Items

#### 1. List Products
*   **Endpoint**: `/api/{tenantSlug}/products`
*   **Method**: `GET`
*   **Auth Requirement**: Yes
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 12,
          "name": "Chicken Momo",
          "sku": "MOMO-CHIX",
          "unit_price": 180.00,
          "stock": 150,
          "category": "momo"
        }
      ]
    }
    ```

### C. Tables / Spaces

#### 1. List Tables
*   **Endpoint**: `/api/{tenantSlug}/spaces`
*   **Method**: `GET`
*   **Auth Requirement**: Yes
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "table_number": "T1",
          "capacity": 4,
          "status": "available"
        }
      ]
    }
    ```

### D. Orders & KOT (Kitchen Order Tickets)

#### 1. Create Order
*   **Endpoint**: `/api/{tenantSlug}/orders`
*   **Method**: `POST`
*   **Sample Request**:
    ```json
    {
      "table_id": 1,
      "type": "dine_in",
      "items": [
        {
          "product_id": 12,
          "quantity": 2,
          "notes": "Spicy"
        }
      ]
    }
    ```
*   **Sample Success Response (`21 Created`)**:
    ```json
    {
      "success": true,
      "message": "Order created successfully",
      "data": {
        "id": 105,
        "order_number": "ORD-00105",
        "status": "pending",
        "total": 360.00
      }
    }
    ```

#### 2. Print Kitchen Order Ticket (KOT)
*   **Endpoint**: `/api/{tenantSlug}/orders/{orderId}/kot`
*   **Method**: `POST`
*   **Auth Requirement**: Yes
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "KOT generated and routed to kitchen printer queue.",
      "data": {
        "kot_id": "KOT-105-1",
        "table": "T1",
        "items": [
          { "name": "Chicken Momo", "quantity": 2, "notes": "Spicy" }
        ]
      }
    }
    ```

### E. Invoices & eSewa Payments

#### 1. Generate Invoice
*   **Endpoint**: `/api/{tenantSlug}/invoices`
*   **Method**: `POST`
*   **Sample Request**:
    ```json
    {
      "order_id": 105,
      "discount_amount": 10.00,
      "service_charge": 0.00,
      "vat_rate": 13.0
    }
    ```

#### 2. Initiate eSewa Sandbox Checkout
*   **Endpoint**: `/api/{tenantSlug}/payments/esewa/initiate`
*   **Method**: `POST`
*   **Sample Request**:
    ```json
    {
      "invoice_id": 204,
      "amount": 395.50
    }
    ```
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "eSewa payment payload generated successfully",
      "data": {
        "payment_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        "form_params": {
          "amount": "395.50",
          "tax_amount": "0.00",
          "total_amount": "395.50",
          "transaction_uuid": "invoice-204-uuid-99a",
          "product_code": "EPAYTEST",
          "signature": "abCdeFGhi12345/="
        }
      }
    }
    ```

---

## 📈 3. Analytics & WhatsApp Daily Reports

### A. Fetch Dashboard Analytics
*   **Endpoint**: `/api/{tenantSlug}/analytics/summary`
*   **Method**: `GET`
*   **Auth Requirement**: Yes
*   **Permissions**: `view_analytics` OR `owner` OR `manager`

### B. Generate Daily Report
*   **Endpoint**: `/api/{tenantSlug}/daily-reports/generate`
*   **Method**: `POST`
*   **Sample Request**:
    ```json
    {
      "report_date": "2026-05-18",
      "regenerate": true
    }
    ```

---

## 👑 4. Super Administrator Central Routes

Central endpoints require a Sanctum token belong to user with `role: super_admin`.

### A. List Platform Tenants
*   **Endpoint**: `/api/admin/tenants`
*   **Method**: `GET`
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "sajilo-restaurant-3d4a",
          "name": "Sajilo Restaurant",
          "status": "active",
          "subscription_plan": "basic-plan",
          "created_at": "2026-05-18T10:00:00Z"
        }
      ]
    }
    ```

### B. Suspend Tenant Workspace
*   **Endpoint**: `/api/admin/tenants/{tenantId}/suspend`
*   **Method**: `PUT`
*   **Sample Success Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Tenant Sajilo Restaurant suspended successfully."
    }
    ```
