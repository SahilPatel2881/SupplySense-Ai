# SupplySense AI — REST API Documentation

## Overview
SupplySense AI provides a full-featured JSON REST API built with Django REST Framework, JWT Authentication, and MongoEngine.

---

## Authentication Endpoints

### `POST /api/auth/login/`
Authenticates user credentials and sends 2FA OTP verification code.
- **Request Body**:
  ```json
  {
    "username": "Sahil Patel",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "OTP verification code dispatched to email",
    "require_otp": true,
    "demo_otp": "748921"
  }
  ```

### `POST /api/auth/verify-otp/`
Verifies 6-digit OTP code and returns JWT Access & Refresh tokens.
- **Request Body**:
  ```json
  {
    "username": "Sahil Patel",
    "otp": "748921"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "<JWT_ACCESS_TOKEN>",
    "refresh": "<JWT_REFRESH_TOKEN>",
    "user": {
      "id": "673f10a8e4b0c12d3e4f5a6b",
      "username": "Sahil Patel",
      "role": "Founder",
      "assigned_warehouse_id": null
    }
  }
  ```

---

## Dashboard Analytics & KPI Endpoints

### `GET /api/dashboard/stats/`
Returns summary KPIs, Chart.js datasets, and operational telemetry.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "summary_kpis": {
      "total_products": 45,
      "total_warehouses": 4,
      "total_suppliers": 12,
      "total_inventory": 18450,
      "total_revenue": 1458000.0
    },
    "monthly_sales_trend": [
      { "month": "Mar", "revenue": 145000 },
      { "month": "Apr", "revenue": 198000 },
      { "month": "May", "revenue": 240000 },
      { "month": "Jun", "revenue": 310000 },
      { "month": "Jul", "revenue": 385000 },
      { "month": "Aug", "revenue": 420000 }
    ],
    "category_stock_distribution": [
      { "category": "Raw Materials", "stock_qty": 1250 },
      { "category": "Finished Goods", "stock_qty": 980 }
    ],
    "top_selling_products": [
      { "name": "Precision Bearing Assembly", "qty": 420 },
      { "name": "Hydraulic Control Valve", "qty": 310 }
    ]
  }
  ```

---

## AI Predictive Analytics Endpoints

### `GET /api/ai/demand-prediction/`
Linear Regression monthly demand forecast with accuracy metrics.
- **Response**:
  ```json
  {
    "next_month_predicted_demand": 380,
    "model_confidence_r2": 0.942,
    "model_accuracy_pct": 94.2
  }
  ```

### `GET /api/ai/stock-risk/`
Random Forest 10-day stockout classification.
- **Response**:
  ```json
  {
    "evaluated_products_count": 45,
    "high_risk_stockouts_count": 3,
    "model_accuracy_pct": 96.5
  }
  ```

### `GET /api/ai/supplier-ranking/`
Multi-metric supplier tier ranking (A/B/C/D).
- **Response**:
  ```json
  {
    "model_accuracy_pct": 95.0,
    "suppliers": [
      { "company_name": "Apex Machining Ltd", "performance_rank": "A", "composite_score": 96.4 }
    ]
  }
  ```

---

## Report PDF Export Endpoints

### `GET /api/reports/<str:report_type>/pdf/`
Streams binary PDF reports compiled dynamically using **ReportLab**.
- **Parameters**: `report_type` (`inventory`, `sales`, `suppliers`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response Content-Type**: `application/pdf`
- **Response Headers**: `Content-Disposition: attachment; filename="<Report_Type>_Report.pdf"`

---

## Master Catalog & CRUD Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/products/` | List all SKUs or create new master product |
| GET / PUT / DELETE | `/api/products/<id>/` | View product details, update prices, or delete SKU |
| GET / POST | `/api/suppliers/` | List or register supplier directory |
| GET / PUT / DELETE | `/api/suppliers/<id>/` | Update contact/metrics or delete supplier |
| GET / POST | `/api/warehouses/` | List or provision new warehouse facility |
| GET / PUT / DELETE | `/api/warehouses/<id>/` | Update warehouse details or delete facility |
| GET / POST | `/api/inventory/movements/` | Record Stock IN, Stock OUT, or Transfer |
| GET / POST | `/api/purchase-orders/` | List POs or create purchase order |
| POST | `/api/purchase-orders/<id>/status/` | Advance PO workflow status |
| GET / POST | `/api/sales/` | List sales invoices or record outward sales transaction |
| GET / PUT | `/api/users/<id>/` | Update user roles or reset user password |
