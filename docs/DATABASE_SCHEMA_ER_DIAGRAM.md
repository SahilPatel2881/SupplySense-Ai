# SupplySense AI — Database Schema & Entity-Relationship (ER) Diagram

## Overview
SupplySense AI uses **MongoDB** as its primary NoSQL document store, mapped object-relational-wise via **MongoEngine ODM** in Django REST Framework. Below is the detailed schema specification and Mermaid ER diagram representing all collections, fields, data types, relationships, and index keys.

---

## Mermaid ER Diagram

```mermaid
erDiagram
    USER ||--o{ LOGIN_AUDIT_LOG : "generates"
    USER ||--o{ STOCK_MOVEMENT : "authorizes"
    USER }|..| font: "assigned_to" WAREHOUSE : "manages/operates"
    
    SUPPLIER ||--o{ PRODUCT : "supplies"
    SUPPLIER ||--o{ PURCHASE_ORDER : "receives"
    
    CATEGORY ||--o{ PRODUCT : "classifies"
    
    WAREHOUSE ||--o{ WAREHOUSE_STOCK : "stores"
    WAREHOUSE ||--o{ PURCHASE_ORDER : "destined_for"
    WAREHOUSE ||--o{ SALES_INVOICE : "dispatches_from"
    WAREHOUSE ||--o{ STOCK_MOVEMENT : "source/target"
    
    PRODUCT ||--o{ WAREHOUSE_STOCK : "tracked_in"
    PRODUCT ||--o{ PO_ITEM : "contains"
    PRODUCT ||--o{ SALE_ITEM : "contains"
    PRODUCT ||--o{ STOCK_MOVEMENT : "moved"
    
    PURCHASE_ORDER ||--|{ PO_ITEM : "has_line_items"
    SALES_INVOICE ||--|{ SALE_ITEM : "has_line_items"

    USER {
        ObjectId id PK
        string username UK
        string password_hash
        string full_name
        string role "Founder | Admin | WarehouseManager | InventoryManager | StockManager | PurchaseManager | SalesManager | WarehouseEmployee"
        ObjectId assigned_warehouse_id FK
        boolean is_temporary_admin
        datetime admin_expires_at
        boolean is_active
        datetime created_at
    }

    SUPPLIER {
        ObjectId id PK
        string name
        string code UK
        string contact_person
        string phone
        float lead_time_days
        float defect_rate
        float fulfillment_rate
        float reliability_score
        string performance_rank "A | B | C | D"
        datetime created_at
    }

    CATEGORY {
        ObjectId id PK
        string name UK
        string description
    }

    PRODUCT {
        ObjectId id PK
        string name
        string sku UK
        string barcode
        string description
        ObjectId category_id FK
        ObjectId supplier_id FK
        string unit
        float cost_price
        float selling_price
        int min_stock_level
        int reorder_point
        datetime created_at
    }

    WAREHOUSE {
        ObjectId id PK
        string name
        string code UK
        string location
        int capacity
        ObjectId manager_id FK
        string contact_number
        string status "Active | Maintenance | Inactive"
        datetime created_at
    }

    WAREHOUSE_STOCK {
        ObjectId id PK
        ObjectId warehouse_id FK
        ObjectId product_id FK
        int quantity
        datetime last_updated
    }

    STOCK_MOVEMENT {
        ObjectId id PK
        ObjectId product_id FK
        ObjectId source_warehouse_id FK
        ObjectId target_warehouse_id FK
        int quantity
        string movement_type "IN | OUT | TRANSFER"
        string reference_doc
        string note
        ObjectId created_by FK
        datetime timestamp
    }

    PURCHASE_ORDER {
        ObjectId id PK
        string po_number UK
        ObjectId supplier_id FK
        ObjectId warehouse_id FK
        float total_amount
        string status "PENDING | PACKED | DISPATCHED | DELIVERED | APPROVED | RECEIVED | CANCELLED"
        ObjectId created_by FK
        datetime created_at
    }

    PO_ITEM {
        ObjectId product_id FK
        int quantity
        float unit_price
    }

    SALES_INVOICE {
        ObjectId id PK
        string invoice_number UK
        string customer_name
        ObjectId warehouse_id FK
        float total_amount
        ObjectId created_by FK
        datetime created_at
    }

    SALE_ITEM {
        ObjectId product_id FK
        int quantity
        float unit_price
    }

    LOGIN_AUDIT_LOG {
        ObjectId id PK
        string username
        string role
        string ip_address
        string user_agent
        string browser
        string os
        string status "Success | Failed | Locked Out"
        string failure_reason
        boolean session_active
        datetime timestamp
    }
```

---

## MongoEngine Collection Specifications

### 1. `User` Collection (`users`)
- `id` (ObjectId, Primary Key)
- `username` (String, Unique, Required)
- `password` (String, Hashed using Django PBKDF2/SHA256)
- `full_name` (String)
- `role` (String, Choice: `Founder`, `Admin`, `WarehouseManager`, `InventoryManager`, `StockManager`, `PurchaseManager`, `SalesManager`, `WarehouseEmployee`)
- `assigned_warehouse_id` (ReferenceField to `Warehouse`, Optional)
- `is_temporary_admin` (Boolean, Default: False)
- `admin_expires_at` (DateTimeField, Optional)
- `is_active` (Boolean, Default: True)
- `created_at` (DateTimeField, Default: UTC Now)

### 2. `Supplier` Collection (`suppliers`)
- `id` (ObjectId, Primary Key)
- `name` (String, Required)
- `code` (String, Unique, Required)
- `contact_person` (String)
- `phone` (String)
- `lead_time_days` (Float, Default: 7.0)
- `defect_rate` (Float, Default: 0.02)
- `fulfillment_rate` (Float, Default: 0.95)
- `reliability_score` (Float, Computed Metric)
- `performance_rank` (String, Choice: `A`, `B`, `C`, `D`)
- `created_at` (DateTimeField, Default: UTC Now)

### 3. `Category` Collection (`categories`)
- `id` (ObjectId, Primary Key)
- `name` (String, Unique, Required)
- `description` (String)

### 4. `Product` Collection (`products`)
- `id` (ObjectId, Primary Key)
- `name` (String, Required)
- `sku` (String, Unique, Required)
- `barcode` (String)
- `description` (String)
- `category` (ReferenceField to `Category`, Required)
- `supplier` (ReferenceField to `Supplier`, Required)
- `unit` (String, Default: `pcs`)
- `cost_price` (Float, Required)
- `selling_price` (Float, Required)
- `min_stock_level` (Int, Default: 10)
- `reorder_point` (Int, Default: 25)
- `created_at` (DateTimeField, Default: UTC Now)

### 5. `Warehouse` Collection (`warehouses`)
- `id` (ObjectId, Primary Key)
- `name` (String, Required)
- `code` (String, Unique, Required)
- `location` (String, Required)
- `capacity` (Int, Default: 20000)
- `manager` (ReferenceField to `User`, Optional)
- `contact_number` (String)
- `status` (String, Default: `Active`)
- `created_at` (DateTimeField, Default: UTC Now)

### 6. `WarehouseStock` Collection (`warehouse_stocks`)
- `id` (ObjectId, Primary Key)
- `warehouse` (ReferenceField to `Warehouse`, Required)
- `product` (ReferenceField to `Product`, Required)
- `quantity` (Int, Default: 0)
- `last_updated` (DateTimeField, Default: UTC Now)
- *Compound Unique Index*: `(warehouse, product)`

### 7. `StockMovement` Collection (`stock_movements`)
- `id` (ObjectId, Primary Key)
- `product` (ReferenceField to `Product`, Required)
- `source_warehouse` (ReferenceField to `Warehouse`, Optional)
- `target_warehouse` (ReferenceField to `Warehouse`, Optional)
- `quantity` (Int, Required)
- `movement_type` (String, Choice: `IN`, `OUT`, `TRANSFER`)
- `reference_doc` (String)
- `note` (String)
- `created_by` (ReferenceField to `User`, Required)
- `timestamp` (DateTimeField, Default: UTC Now)

### 8. `PurchaseOrder` Collection (`purchase_orders`)
- `id` (ObjectId, Primary Key)
- `po_number` (String, Unique, Required)
- `supplier` (ReferenceField to `Supplier`, Required)
- `warehouse` (ReferenceField to `Warehouse`, Required)
- `items` (EmbeddedDocumentList of `POItem`)
- `total_amount` (Float, Default: 0.0)
- `status` (String, Choice: `PENDING`, `PACKED`, `DISPATCHED`, `DELIVERED`, `APPROVED`, `RECEIVED`, `CANCELLED`)
- `created_by` (ReferenceField to `User`, Required)
- `created_at` (DateTimeField, Default: UTC Now)

### 9. `SalesInvoice` Collection (`sales_invoices`)
- `id` (ObjectId, Primary Key)
- `invoice_number` (String, Unique, Required)
- `customer_name` (String, Required)
- `warehouse` (ReferenceField to `Warehouse`, Required)
- `items` (EmbeddedDocumentList of `SaleItem`)
- `total_amount` (Float, Default: 0.0)
- `created_by` (ReferenceField to `User`, Required)
- `created_at` (DateTimeField, Default: UTC Now)

### 10. `LoginAuditLog` Collection (`login_audit_logs`)
- `id` (ObjectId, Primary Key)
- `username` (String, Required)
- `role` (String)
- `ip_address` (String)
- `user_agent` (String)
- `browser` (String)
- `os` (String)
- `status` (String, Choice: `Success`, `Failed`, `Locked Out`)
- `failure_reason` (String)
- `session_active` (Boolean, Default: False)
- `timestamp` (DateTimeField, Default: UTC Now)
