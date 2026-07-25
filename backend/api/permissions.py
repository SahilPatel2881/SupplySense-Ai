from rest_framework.permissions import BasePermission

class IsAuthenticatedUser(BasePermission):
    """Allows access to any valid authenticated user role."""
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False))


class IsAdminUserRole(BasePermission):
    """Allows access strictly only to Admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            getattr(request.user, 'is_authenticated', False) and 
            getattr(request.user, 'role', None) == 'Admin'
        )


class IsWarehouseManagerRole(BasePermission):
    """Allows access to Admins and Warehouse Managers."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            getattr(request.user, 'is_authenticated', False) and 
            getattr(request.user, 'role', None) in ['Admin', 'WarehouseManager']
        )


class IsAdminOrAssignedWarehouse(BasePermission):
    """
    Admins can access everything.
    Other roles are restricted to their assigned warehouse data.
    """
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False))

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', None) == 'Admin':
            return True
        
        assigned_wh = getattr(request.user, 'assigned_warehouse_id', None)
        obj_wh = getattr(obj, 'warehouse_id', None) or getattr(obj, 'assigned_warehouse_id', None)
        
        if not assigned_wh or not obj_wh:
            return False
            
        return str(assigned_wh) == str(obj_wh)
