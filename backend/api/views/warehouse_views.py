from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import CanAccessWarehouses
from api.models import Warehouse, Stock, User

def format_warehouse_data(wh):
    d = wh.to_dict()
    cap = wh.capacity if getattr(wh, 'capacity', None) is not None else 10000
    stocks = Stock.objects(warehouse_id=str(wh.id))
    current_stock_qty = sum(s.quantity for s in stocks)
    d['current_stock_qty'] = current_stock_qty
    d['capacity_usage_pct'] = round((current_stock_qty / cap) * 100, 1) if cap > 0 else 0

    assigned_users = list(User.objects(assigned_warehouse_id=str(wh.id), is_active=True))
    
    manager_roles = ['WarehouseManager', 'SalesManager', 'StockManager', 'InventoryManager', 'PurchaseManager']
    assigned_managers = {}
    for role in manager_roles:
        mgr = next((u for u in assigned_users if u.role == role), None)
        if mgr:
            assigned_managers[role] = {
                'id': str(mgr.id),
                'username': mgr.username,
                'full_name': mgr.full_name or mgr.username
            }
        else:
            assigned_managers[role] = None

    employees = [
        {
            'id': str(u.id),
            'username': u.username,
            'full_name': u.full_name or u.username
        }
        for u in assigned_users if u.role == 'WarehouseEmployee'
    ]

    wm = assigned_managers.get('WarehouseManager')
    if wm:
        d['manager_name'] = wm['full_name']
    elif wh.manager_id:
        try:
            mgr = User.objects(id=wh.manager_id).first()
            d['manager_name'] = mgr.full_name or mgr.username if mgr else "Unassigned"
        except Exception:
            d['manager_name'] = "Unassigned"
    else:
        d['manager_name'] = "Unassigned"

    d['assigned_managers'] = assigned_managers
    d['employees'] = employees
    d['employee_count'] = len(employees)
    return d


def auto_provision_warehouse_staff(wh):
    wh_id_str = str(wh.id)
    code_raw = wh.code.replace('WH-', '').replace('-', '_').lower()
    if not code_raw or len(code_raw) < 2:
        code_raw = wh.name.replace(' ', '_').lower()[:10]
    clean_name = wh.name.split(' ')[0]

    manager_roles = [
        ('WarehouseManager', 'Warehouse Manager', f"{code_raw}_wm", f"{clean_name} Warehouse Manager"),
        ('SalesManager', 'Sales Manager', f"{code_raw}_sm", f"{clean_name} Sales Manager"),
        ('StockManager', 'Stock Manager', f"{code_raw}_stm", f"{clean_name} Stock Manager"),
        ('InventoryManager', 'Inventory Manager', f"{code_raw}_im", f"{clean_name} Inventory Manager"),
        ('PurchaseManager', 'Purchase Manager', f"{code_raw}_pm", f"{clean_name} Purchase Manager"),
    ]

    for role, role_title, uname, fname in manager_roles:
        u = User.objects(assigned_warehouse_id=wh_id_str, role=role).first()
        if not u:
            u = User.objects(username=uname).first()
            if not u:
                u = User(
                    username=uname,
                    full_name=fname,
                    role=role,
                    assigned_warehouse_id=wh_id_str,
                    is_active=True
                )
                u.set_password(f"{code_raw}_123")
            else:
                u.assigned_warehouse_id = wh_id_str
                u.role = role
            u.save()
        if role == 'WarehouseManager' and not wh.manager_id:
            wh.manager_id = str(u.id)
            wh.save()

    existing_emp = User.objects(assigned_warehouse_id=wh_id_str, role='WarehouseEmployee')
    if existing_emp.count() < 2:
        for i in range(1, 4):
            emp_uname = f"{code_raw}_emp{i}"
            emp_u = User.objects(username=emp_uname).first()
            if not emp_u:
                emp_u = User(
                    username=emp_uname,
                    full_name=f"{clean_name} Warehouse Employee {i}",
                    role="WarehouseEmployee",
                    assigned_warehouse_id=wh_id_str,
                    is_active=True
                )
                emp_u.set_password(f"{code_raw}_emp123")
                emp_u.save()
            else:
                emp_u.assigned_warehouse_id = wh_id_str
                emp_u.role = "WarehouseEmployee"
                emp_u.save()


class WarehouseListCreateView(APIView):
    permission_classes = [CanAccessWarehouses]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', None)
        if role in ['Founder', 'Admin']:
            warehouses = Warehouse.objects()
        else:
            if user.assigned_warehouse_id:
                warehouses = Warehouse.objects(id=user.assigned_warehouse_id)
            else:
                warehouses = Warehouse.objects()

        data = [format_warehouse_data(wh) for wh in warehouses]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        role = getattr(user, 'role', None)
        if role not in ['Founder', 'Admin']:
            return Response({'error': 'Only Founder or Admins can create warehouses'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name')
        code = request.data.get('code')
        location = request.data.get('location')
        capacity = request.data.get('capacity', 10000)
        manager_id = request.data.get('manager_id')
        contact_number = request.data.get('contact_number', '')

        if not name or not code or not location:
            return Response({'error': 'Name, code, and location are required'}, status=status.HTTP_400_BAD_REQUEST)

        if Warehouse.objects(code=code).first():
            return Response({'error': 'Warehouse code already exists'}, status=status.HTTP_400_BAD_REQUEST)

        wh = Warehouse(
            name=name,
            code=code,
            location=location,
            capacity=int(capacity),
            manager_id=manager_id if manager_id else None,
            contact_number=contact_number
        )
        wh.save()
        auto_provision_warehouse_staff(wh)
        return Response(format_warehouse_data(wh), status=status.HTTP_201_CREATED)



class WarehouseDetailView(APIView):
    permission_classes = [CanAccessWarehouses]

    def get_object(self, pk):
        return Warehouse.objects(id=pk).first()

    def get(self, request, pk):
        user = request.user
        role = getattr(user, 'role', None)
        wh = self.get_object(pk)
        if not wh:
            return Response({'error': 'Warehouse not found'}, status=status.HTTP_404_NOT_FOUND)

        if role not in ['Founder', 'Admin'] and str(user.assigned_warehouse_id) != str(wh.id):
            return Response({'error': 'You can only view your assigned warehouse'}, status=status.HTTP_403_FORBIDDEN)

        return Response(format_warehouse_data(wh), status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = request.user
        role = getattr(user, 'role', None)
        if role not in ['Founder', 'Admin']:
            return Response({'error': 'Only Founder or Admins can modify warehouse configuration'}, status=status.HTTP_403_FORBIDDEN)

        wh = self.get_object(pk)
        if not wh:
            return Response({'error': 'Warehouse not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            wh.name = request.data['name']
        if 'location' in request.data:
            wh.location = request.data['location']
        if 'capacity' in request.data:
            wh.capacity = int(request.data['capacity'])
        if 'manager_id' in request.data:
            wh.manager_id = request.data['manager_id'] if request.data['manager_id'] else None
        if 'status' in request.data:
            wh.status = request.data['status']
        if 'contact_number' in request.data:
            wh.contact_number = request.data['contact_number']

        wh.save()
        return Response(format_warehouse_data(wh), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = request.user
        role = getattr(user, 'role', None)
        if role not in ['Founder', 'Admin']:
            return Response({'error': 'Only Founder or Admins can delete warehouses'}, status=status.HTTP_403_FORBIDDEN)

        wh = self.get_object(pk)
        if not wh:
            return Response({'error': 'Warehouse not found'}, status=status.HTTP_404_NOT_FOUND)
        wh.delete()
        return Response({'message': 'Warehouse deleted successfully'}, status=status.HTTP_200_OK)
