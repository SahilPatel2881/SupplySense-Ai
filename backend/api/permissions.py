import datetime
from rest_framework.permissions import BasePermission

def get_user_role(request):
    if not (request.user and getattr(request.user, 'is_authenticated', False)):
        return None
    
    mongo_user = getattr(request.user, 'mongo_user', None)
    if mongo_user and mongo_user.is_temporary_admin:
        if mongo_user.admin_expires_at and datetime.datetime.utcnow() > mongo_user.admin_expires_at:
            mongo_user.is_temporary_admin = False
            mongo_user.admin_expires_at = None
            mongo_user.role = 'WarehouseEmployee'
            mongo_user.save()
            return 'WarehouseEmployee'
        return 'Admin'
        
    return getattr(request.user, 'role', None)


class IsAuthenticatedUser(BasePermission):
    """Allows access to any valid authenticated user role."""
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False))


class IsFounderOrAdmin(BasePermission):
    """Allows access strictly only to Founder & Admin users (User Management & System Settings)."""
    def has_permission(self, request, view):
        role = get_user_role(request)
        return role in ['Founder', 'Admin']


# Alias for backwards compatibility
IsAdminUserRole = IsFounderOrAdmin


class CanAccessWarehouses(BasePermission):
    """
    Warehouse Management:
    - Founder, Admin: Full access (GET, POST, PUT, DELETE)
    - WarehouseManager: GET assigned warehouse only
    - InventoryManager, PurchaseManager, SalesManager, WarehouseEmployee: ❌
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        if role in ['Founder', 'Admin']:
            return True
        if role in ['WarehouseManager', 'InventoryManager', 'StockManager', 'PurchaseManager', 'SalesManager', 'WarehouseEmployee']:
            return request.method == 'GET'
        return False


class CanAccessCategories(BasePermission):
    """
    Category Management:
    - Founder, Admin: Full access (GET, POST, PUT, DELETE)
    - All other authenticated roles: View only (GET)
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        if role in ['Founder', 'Admin']:
            return True
        if role in ['WarehouseManager', 'InventoryManager', 'StockManager', 'PurchaseManager', 'SalesManager', 'WarehouseEmployee']:
            return request.method == 'GET'
        return False


class CanAccessProducts(BasePermission):
    """
    Product Management:
    - Founder, Admin, InventoryManager: Full access (GET, POST, PUT, DELETE)
    - WarehouseManager, PurchaseManager, SalesManager, StockManager, WarehouseEmployee: View only (GET)
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        if role in ['Founder', 'Admin', 'InventoryManager']:
            return True
        if role in ['WarehouseManager', 'PurchaseManager', 'SalesManager', 'StockManager', 'WarehouseEmployee']:
            return request.method == 'GET'
        return False


class CanAccessSuppliers(BasePermission):
    """
    Supplier Management:
    - Founder, Admin, PurchaseManager: Full access (GET, POST, PUT, DELETE)
    - WarehouseManager, InventoryManager, StockManager, SalesManager, WarehouseEmployee: View only (GET)
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        if role in ['Founder', 'Admin', 'PurchaseManager']:
            return True
        if role in ['WarehouseManager', 'InventoryManager', 'StockManager', 'SalesManager', 'WarehouseEmployee']:
            return request.method == 'GET'
        return False


class CanAccessInventory(BasePermission):
    """
    Inventory Management:
    - Founder, Admin, InventoryManager, WarehouseManager, StockManager: Full inventory stock view & adjustments
    - PurchaseManager: Stock In / Receive
    - SalesManager: View stock (GET)
    - WarehouseEmployee: Scoped view assigned warehouse stock (GET)
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        return role in ['Founder', 'Admin', 'InventoryManager', 'WarehouseManager', 'StockManager', 'PurchaseManager', 'SalesManager', 'WarehouseEmployee']


class CanStockIn(BasePermission):
    """Allows Stock In / Inbound receipt to Founder, Admin, InventoryManager, WarehouseManager, StockManager, PurchaseManager."""
    def has_permission(self, request, view):
        role = get_user_role(request)
        return role in ['Founder', 'Admin', 'InventoryManager', 'WarehouseManager', 'StockManager', 'PurchaseManager']


class CanStockOutOrTransfer(BasePermission):
    """Allows Stock Out / Transfers to Founder, Admin, InventoryManager, WarehouseManager, StockManager."""
    def has_permission(self, request, view):
        role = get_user_role(request)
        return role in ['Founder', 'Admin', 'InventoryManager', 'WarehouseManager', 'StockManager']


class CanAccessPurchaseOrders(BasePermission):
    """
    Purchase Orders:
    - Founder, Admin, PurchaseManager: Full PO access (GET, POST create, Approve, Receive)
    - WarehouseManager: View & Receive POs (GET, POST receive)
    - InventoryManager, StockManager, SalesManager, WarehouseEmployee: View POs (GET)
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        if role in ['Founder', 'Admin', 'PurchaseManager']:
            return True
        if role == 'WarehouseManager':
            return request.method in ['GET', 'POST']
        if role in ['InventoryManager', 'StockManager', 'SalesManager', 'WarehouseEmployee']:
            return request.method == 'GET'
        return False


class CanCreateOrApprovePO(BasePermission):
    """Only Founder, Admin, and PurchaseManager can create or approve POs."""
    def has_permission(self, request, view):
        role = get_user_role(request)
        return role in ['Founder', 'Admin', 'PurchaseManager']


class CanReceivePO(BasePermission):
    """Founder, Admin, PurchaseManager, WarehouseManager, and StockManager can receive POs."""
    def has_permission(self, request, view):
        role = get_user_role(request)
        return role in ['Founder', 'Admin', 'PurchaseManager', 'WarehouseManager', 'StockManager']


class CanAccessSales(BasePermission):
    """
    Sales Management:
    - Founder, Admin, SalesManager, WarehouseManager: Full sales & invoice management
    - InventoryManager, PurchaseManager, StockManager, WarehouseEmployee: View sales (GET)
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        if not role:
            return False
        if role in ['Founder', 'Admin', 'SalesManager', 'WarehouseManager']:
            return True
        if role in ['InventoryManager', 'PurchaseManager', 'StockManager', 'WarehouseEmployee']:
            return request.method == 'GET'
        return False


class CanAccessReports(BasePermission):
    """
    Reports:
    - Founder, Admin, WarehouseManager, InventoryManager, PurchaseManager, SalesManager, StockManager, WarehouseEmployee: View reports
    """
    def has_permission(self, request, view):
        role = get_user_role(request)
        return role in ['Founder', 'Admin', 'WarehouseManager', 'InventoryManager', 'PurchaseManager', 'SalesManager', 'StockManager', 'WarehouseEmployee']


class IsAdminOrAssignedWarehouse(BasePermission):
    """
    Founder and Admin can view everything across warehouses.
    Other roles are restricted to their assigned warehouse data.
    """
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False))

    def has_object_permission(self, request, view, obj):
        role = get_user_role(request)
        if role in ['Founder', 'Admin']:
            return True
        
        assigned_wh = getattr(request.user, 'assigned_warehouse_id', None)
        obj_wh = getattr(obj, 'warehouse_id', None) or getattr(obj, 'assigned_warehouse_id', None)
        
        if not assigned_wh or not obj_wh:
            return False
            
        return str(assigned_wh) == str(obj_wh)
