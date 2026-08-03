from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True, required=False)
    full_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['Admin', 'WarehouseManager'], default='WarehouseManager')
    assigned_warehouse_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.CharField(read_only=True)


class WarehouseSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    location = serializers.CharField(required=True)
    capacity = serializers.IntegerField(default=10000)
    manager_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=['Active', 'Maintenance', 'Inactive'], default='Active')
    created_at = serializers.CharField(read_only=True)


class CategorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    description = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.CharField(read_only=True)


class SupplierSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    contact_person = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    lead_time_days = serializers.FloatField(default=7.0)
    defect_rate = serializers.FloatField(default=0.02)
    fulfillment_rate = serializers.FloatField(default=0.95)
    reliability_score = serializers.FloatField(default=85.0)
    status = serializers.ChoiceField(choices=['Active', 'Under Review', 'Inactive'], default='Active')
    created_at = serializers.CharField(read_only=True)


class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(required=True)
    sku = serializers.CharField(required=True)
    barcode = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.CharField(required=True)
    supplier_id = serializers.CharField(required=True)
    unit = serializers.CharField(default='pcs')
    cost_price = serializers.FloatField(required=True)
    selling_price = serializers.FloatField(required=True)
    min_stock_level = serializers.IntegerField(default=20)
    reorder_point = serializers.IntegerField(default=35)
    created_at = serializers.CharField(read_only=True)


class StockSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    product_id = serializers.CharField(required=True)
    warehouse_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(default=0)
    batch_number = serializers.CharField(required=False, allow_blank=True)
    expiry_date = serializers.CharField(required=False, allow_null=True)
    last_updated = serializers.CharField(read_only=True)


class StockMovementSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    movement_type = serializers.ChoiceField(choices=['IN', 'OUT', 'TRANSFER'])
    product_id = serializers.CharField(required=True)
    source_warehouse_id = serializers.CharField(required=False, allow_null=True)
    target_warehouse_id = serializers.CharField(required=False, allow_null=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    reference_doc = serializers.CharField(required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True)
    performed_by_id = serializers.CharField(read_only=True)
    timestamp = serializers.CharField(read_only=True)


class POItemSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=True)
    product_name = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    unit_price = serializers.FloatField(required=True, min_value=0.0)
    total = serializers.FloatField(read_only=True)


class PurchaseOrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    po_number = serializers.CharField(required=False) # Auto generated if missing
    supplier_id = serializers.CharField(required=True)
    warehouse_id = serializers.CharField(required=True)
    items = POItemSerializer(many=True)
    total_amount = serializers.FloatField(read_only=True)
    status = serializers.ChoiceField(choices=['DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'], default='PENDING')
    created_by_id = serializers.CharField(read_only=True)
    approved_by_id = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.CharField(read_only=True)
    updated_at = serializers.CharField(read_only=True)


class SaleItemSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=True)
    product_name = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    unit_price = serializers.FloatField(required=True, min_value=0.0)
    total = serializers.FloatField(read_only=True)


class SaleSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    invoice_number = serializers.CharField(required=False)
    warehouse_id = serializers.CharField(required=True)
    customer_name = serializers.CharField(default='Walk-in Customer')
    items = SaleItemSerializer(many=True)
    total_amount = serializers.FloatField(read_only=True)
    payment_status = serializers.ChoiceField(choices=['PAID', 'PENDING', 'CANCELLED'], default='PAID')
    recorded_by_id = serializers.CharField(read_only=True)
    created_at = serializers.CharField(read_only=True)


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(required=False, allow_null=True)
    warehouse_id = serializers.CharField(required=False, allow_null=True)
    title = serializers.CharField(required=True)
    message = serializers.CharField(required=True)
    type = serializers.ChoiceField(choices=['LOW_STOCK', 'PO_APPROVAL', 'REORDER_RECOMMENDATION', 'SYSTEM'], default='SYSTEM')
    is_read = serializers.BooleanField(default=False)
    created_at = serializers.CharField(read_only=True)
