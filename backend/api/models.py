import datetime
import mongoengine as me
from django.contrib.auth.hashers import make_password, check_password

class User(me.Document):
    meta = {'collection': 'users', 'indexes': ['username', 'email', 'role']}
    
    username = me.StringField(required=True, unique=True, max_length=50)
    email = me.EmailField(required=True, unique=True)
    password_hash = me.StringField(required=True)
    full_name = me.StringField(max_length=100)
    role = me.StringField(
        required=True,
        choices=['Admin', 'WarehouseManager', 'InventoryManager', 'StockManager', 'PurchaseManager', 'SalesManager', 'WarehouseEmployee'],
        default='WarehouseManager'
    )
    assigned_warehouse_id = me.StringField(default=None) # MongoDB ObjectId string or None
    is_active = me.BooleanField(default=True)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "assigned_warehouse_id": self.assigned_warehouse_id,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Warehouse(me.Document):
    meta = {'collection': 'warehouses', 'indexes': ['code', 'name']}
    
    name = me.StringField(required=True, max_length=100)
    code = me.StringField(required=True, unique=True, max_length=30)
    location = me.StringField(required=True, max_length=200)
    capacity = me.IntField(default=10000)
    manager_id = me.StringField(default=None) # User ObjectId string
    contact_number = me.StringField(max_length=30)
    status = me.StringField(choices=['Active', 'Maintenance', 'Inactive'], default='Active')
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "code": self.code,
            "location": self.location,
            "capacity": self.capacity,
            "manager_id": self.manager_id,
            "contact_number": self.contact_number,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Category(me.Document):
    meta = {'collection': 'categories', 'indexes': ['name', 'code']}
    
    name = me.StringField(required=True, unique=True, max_length=100)
    code = me.StringField(required=True, unique=True, max_length=30)
    description = me.StringField(max_length=300)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Supplier(me.Document):
    meta = {'collection': 'suppliers', 'indexes': ['name', 'code']}
    
    name = me.StringField(required=True, max_length=100)
    code = me.StringField(required=True, unique=True, max_length=30)
    contact_person = me.StringField(max_length=100)
    email = me.EmailField()
    phone = me.StringField(max_length=30)
    address = me.StringField(max_length=200)
    lead_time_days = me.FloatField(default=7.0) # Average lead time in days
    defect_rate = me.FloatField(default=0.02) # e.g. 0.02 = 2% defect rate
    fulfillment_rate = me.FloatField(default=0.95) # e.g. 0.95 = 95% on-time delivery rate
    reliability_score = me.FloatField(default=85.0) # 0 to 100
    status = me.StringField(choices=['Active', 'Under Review', 'Inactive'], default='Active')
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "code": self.code,
            "contact_person": self.contact_person,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "lead_time_days": self.lead_time_days,
            "defect_rate": self.defect_rate,
            "fulfillment_rate": self.fulfillment_rate,
            "reliability_score": self.reliability_score,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Product(me.Document):
    meta = {'collection': 'products', 'indexes': ['sku', 'barcode', 'name', 'category_id']}
    
    name = me.StringField(required=True, max_length=150)
    sku = me.StringField(required=True, unique=True, max_length=50)
    barcode = me.StringField(max_length=50)
    description = me.StringField(max_length=500)
    category_id = me.StringField(required=True)
    supplier_id = me.StringField(required=True)
    unit = me.StringField(default='pcs', max_length=20)
    cost_price = me.FloatField(required=True, min_value=0.0)
    selling_price = me.FloatField(required=True, min_value=0.0)
    min_stock_level = me.IntField(default=20)
    reorder_point = me.IntField(default=35)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "sku": self.sku,
            "barcode": self.barcode,
            "description": self.description,
            "category_id": self.category_id,
            "supplier_id": self.supplier_id,
            "unit": self.unit,
            "cost_price": self.cost_price,
            "selling_price": self.selling_price,
            "min_stock_level": self.min_stock_level,
            "reorder_point": self.reorder_point,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Stock(me.Document):
    meta = {'collection': 'stocks', 'indexes': [('product_id', 'warehouse_id')]}
    
    product_id = me.StringField(required=True)
    warehouse_id = me.StringField(required=True)
    quantity = me.IntField(default=0, min_value=0)
    batch_number = me.StringField(max_length=50)
    expiry_date = me.DateTimeField(default=None)
    last_updated = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "product_id": self.product_id,
            "warehouse_id": self.warehouse_id,
            "quantity": self.quantity,
            "batch_number": self.batch_number,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }


class StockMovement(me.Document):
    meta = {'collection': 'stock_movements', 'indexes': ['product_id', 'movement_type', 'timestamp']}
    
    movement_type = me.StringField(required=True, choices=['IN', 'OUT', 'TRANSFER'])
    product_id = me.StringField(required=True)
    source_warehouse_id = me.StringField(default=None)
    target_warehouse_id = me.StringField(default=None)
    quantity = me.IntField(required=True, min_value=1)
    reference_doc = me.StringField(max_length=100) # PO Number, Sales Invoice #, Transfer ID
    note = me.StringField(max_length=300)
    performed_by_id = me.StringField(required=True)
    timestamp = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "movement_type": self.movement_type,
            "product_id": self.product_id,
            "source_warehouse_id": self.source_warehouse_id,
            "target_warehouse_id": self.target_warehouse_id,
            "quantity": self.quantity,
            "reference_doc": self.reference_doc,
            "note": self.note,
            "performed_by_id": self.performed_by_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class POItem(me.EmbeddedDocument):
    product_id = me.StringField(required=True)
    product_name = me.StringField()
    quantity = me.IntField(required=True, min_value=1)
    unit_price = me.FloatField(required=True, min_value=0.0)
    total = me.FloatField(required=True, min_value=0.0)

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "total": self.total
        }


class PurchaseOrder(me.Document):
    meta = {'collection': 'purchase_orders', 'indexes': ['po_number', 'supplier_id', 'status']}
    
    po_number = me.StringField(required=True, unique=True, max_length=50)
    supplier_id = me.StringField(required=True)
    warehouse_id = me.StringField(required=True)
    items = me.EmbeddedDocumentListField(POItem)
    total_amount = me.FloatField(default=0.0)
    status = me.StringField(choices=['DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'], default='PENDING')
    created_by_id = me.StringField(required=True)
    approved_by_id = me.StringField(default=None)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "po_number": self.po_number,
            "supplier_id": self.supplier_id,
            "warehouse_id": self.warehouse_id,
            "items": [item.to_dict() for item in self.items],
            "total_amount": self.total_amount,
            "status": self.status,
            "created_by_id": self.created_by_id,
            "approved_by_id": self.approved_by_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class SaleItem(me.EmbeddedDocument):
    product_id = me.StringField(required=True)
    product_name = me.StringField()
    quantity = me.IntField(required=True, min_value=1)
    unit_price = me.FloatField(required=True, min_value=0.0)
    total = me.FloatField(required=True, min_value=0.0)

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "total": self.total
        }


class Sale(me.Document):
    meta = {'collection': 'sales', 'indexes': ['invoice_number', 'warehouse_id', 'created_at']}
    
    invoice_number = me.StringField(required=True, unique=True, max_length=50)
    warehouse_id = me.StringField(required=True)
    customer_name = me.StringField(default='Walk-in Customer', max_length=100)
    items = me.EmbeddedDocumentListField(SaleItem)
    total_amount = me.FloatField(default=0.0)
    payment_status = me.StringField(choices=['PAID', 'PENDING', 'CANCELLED'], default='PAID')
    recorded_by_id = me.StringField(required=True)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "invoice_number": self.invoice_number,
            "warehouse_id": self.warehouse_id,
            "customer_name": self.customer_name,
            "items": [item.to_dict() for item in self.items],
            "total_amount": self.total_amount,
            "payment_status": self.payment_status,
            "recorded_by_id": self.recorded_by_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Notification(me.Document):
    meta = {'collection': 'notifications', 'indexes': ['user_id', 'is_read', 'created_at']}
    
    user_id = me.StringField(default=None) # Null means broadcast or system alert
    warehouse_id = me.StringField(default=None)
    title = me.StringField(required=True, max_length=150)
    message = me.StringField(required=True, max_length=500)
    type = me.StringField(choices=['LOW_STOCK', 'PO_APPROVAL', 'REORDER_RECOMMENDATION', 'SYSTEM'], default='SYSTEM')
    is_read = me.BooleanField(default=False)
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "warehouse_id": self.warehouse_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
