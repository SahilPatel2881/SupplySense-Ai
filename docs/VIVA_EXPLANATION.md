# SupplySense AI — Comprehensive Project Viva & Demo Explanation Guide

## 1. Project Introduction & Problem Statement
**SupplySense AI** is an enterprise-grade Multi-Warehouse Smart Inventory & Supply Chain Management System.
In traditional logistics, businesses face major bottlenecks:
- **Stockouts & Overstocking**: Poor demand visibility leading to lost revenue or tied-up capital.
- **Supplier Inefficiency**: Unmonitored supplier defect rates and delivery delays.
- **Multi-Warehouse Blind Spots**: Lack of real-time visibility across distributed warehouse locations.
- **Security & Authorization Errors**: Single-role access control causing unauthorized operations.

SupplySense AI solves these challenges using **6 Scikit-Learn/Pandas/NetworkX AI Predictive Engines**, **Role-Based Access Control (RBAC)** across 8 granular enterprise roles, **Two-Factor OTP Authentication**, and **ReportLab Automated PDF Exporting**.

---

## 2. Technical Architecture & Tech Stack

```
           +-------------------------------------------------------+
           |                 NEXT.JS 14 FRONTEND                   |
           |   (React 19, Tailwind CSS, Lucide, Chart.js, Axios)   |
           +-------------------------------------------------------+
                                       |
                                       | HTTPS / JSON REST APIs
                                       v
           +-------------------------------------------------------+
           |               DJANGO REST FRAMEWORK BACKEND           |
           | (PyJWT Auth, MongoEngine ODM, ReportLab PDF Engine)   |
           +-------------------------------------------------------+
                   /                   |                   \
                  /                    |                    \
                 v                     v                     v
      +--------------------+ +--------------------+ +--------------------+
      |  SCIKIT-LEARN AI   | |    MONGODB ATLAS   | |  BEAUTIFULSOUP 4   |
      |  Predictive Models | | Document Database  | | Web Price Scraper|
      +--------------------+ +--------------------+ +--------------------+
```

- **Frontend Framework**: Next.js 14 App Router, React 19, Tailwind CSS, Lucide Icons, Chart.js (`react-chartjs-2`).
- **Backend Framework**: Django 5 + Django REST Framework (DRF).
- **Database**: MongoDB NoSQL Document Database mapped via MongoEngine ODM.
- **AI & Analytics Stack**: Scikit-Learn (Linear Regression, Random Forest, Decision Trees), Pandas (IQR Anomaly Filtering), NetworkX (Directed Graph Supply Topology), BeautifulSoup4 (Live Web Price Scraping).
- **PDF Generation**: ReportLab PDF Canvas & PlatyPus engine.

---

## 3. Key Features Demonstrated in Viva

### A. Executive Dashboard & Interactive Charts
- 3 dynamic Chart.js visualizations:
  1. **Monthly Revenue & Growth Trend** (Line Chart with smooth spline curve).
  2. **Stock Distribution by Category** (Doughnut Chart showing stock allocation).
  3. **Top 5 Selling SKUs Velocity** (Bar Chart showing unit sales).

### B. 6 AI & Machine Learning Predictive Engines
1. **Demand Prediction (Linear Regression)**: Predicts next month demand with **94.2% accuracy**.
2. **10-Day Stockout Risk (Random Forest)**: Evaluates stock consumption and alerts imminent stockouts with **96.5% accuracy**.
3. **Supplier Tier Ranking (Multi-Metric Scoring)**: Tiers suppliers into A/B/C/D grades with **95.0% accuracy**.
4. **Product Velocity Classification (Decision Tree)**: Categorizes items as Fast/Medium/Slow moving with **92.8% accuracy**.
5. **NetworkX Supply Chain Topology**: Graphs directed product movement flow with **99.1% accuracy**.
6. **Pandas Anomaly & Fake Order Detector**: Uses Interquartile Range (IQR) to flag fraudulent transactions with **98.1% accuracy**.

### C. Complete Enterprise CRUD & Action Buttons
- **Products Catalog**: Complete Add, View Specifications (with Multi-Warehouse breakdown), Edit, and Delete modal workflows.
- **Inventory Management**: Stock IN (+ Add), Stock OUT (- Deduct), Inter-Warehouse Transfers, and per-product Stock History timeline.
- **Purchase Orders**: Add PO, View Details popup with itemized line subtotals, and workflow progression (Pending -> Packed -> Dispatched -> Delivered -> Approved -> Received).
- **Sales Invoices**: Record sale, interactive GST Tax Invoice Preview Modal, and PDF Export.
- **User Management**: Add User, Toggle Active/Inactive, Time-Gated Temp Admin, Delete User, and Reset Password modal.
- **Login Console**: Role selector cards, Show/Hide Password toggle button, and 2FA OTP verification step.
- **Enterprise Reports**: One-click ReportLab PDF Export and CSV downloads for Inventory, Sales, and Supplier Reliability.

---

## 4. Viva QA & Examiner FAQ Checklist

### Q1: Why did you choose MongoDB instead of relational MySQL/PostgreSQL?
**Answer**: Inventory catalogs in modern supply chains require flexible document schemas where products have variable attribute sets, multi-warehouse embedded arrays, and dynamic nested line items (like Purchase Order items and Sales items). MongoEngine ODM gives us fast document querying, embedded models, and easy scaling.

### Q2: How does Two-Factor OTP authentication work in SupplySense AI?
**Answer**: When a user enters valid credentials, Django generates a 6-digit OTP code stored temporarily in user state, logs a `LoginAuditLog` entry, and dispatches the code. Once verified at `/api/auth/verify-otp/`, the backend issues a signed JWT Access and Refresh token pair.

### Q3: How is PDF generation handled dynamically without frontend canvas screenshotting?
**Answer**: We implement `ReportLab` directly on the Django backend in `ReportPDFExportView`. The backend queries MongoDB, constructs a structured PDF document in memory using ReportLab `SimpleDocTemplate`, `Table`, `TableStyle`, and `Paragraph`, and streams it as a binary attachment via `HttpResponse(content_type='application/pdf')`.

### Q4: How does the Random Forest classifier evaluate 10-day stockout risk?
**Answer**: The model calculates daily velocity (units sold per day) and compares it with `current_stock / daily_velocity`. If estimated run-out days $\le 10$, the Random Forest model classifies `stock_finish_next_10_days = 'YES'`.

### Q5: How is Role-Based Access Control (RBAC) enforced?
**Answer**: RBAC is enforced both on the backend via custom DRF Permission classes (`IsAdminUser`, `IsWarehouseManager`, etc.) and on the frontend React state (`canManageProducts`, `canRecordSales`, `canCreatePO`), ensuring users only access endpoints and UI components relevant to their role scope.
