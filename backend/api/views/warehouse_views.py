from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser, IsAdminUserRole
from api.models import Warehouse, Stock, User

class WarehouseListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        if user.role == 'Admin':
            warehouses = Warehouse.objects()
        else:
            # Warehouse manager can only view their assigned warehouse or list all for reference
            if user.assigned_warehouse_id:
                warehouses = Warehouse.objects(id=user.assigned_warehouse_id)
            else:
                warehouses = Warehouse.objects()

        data = []
        for wh in warehouses:
            d = wh.to_dict()
            # Calculate current total stock and capacity usage
            stocks = Stock.objects(warehouse_id=str(wh.id))
            current_stock_qty = sum(s.quantity for s in stocks)
            d['current_stock_qty'] = current_stock_qty
            d['capacity_usage_pct'] = round((current_stock_qty / wh.capacity) * 100, 1) if wh.capacity > 0 else 0
            if wh.manager_id:
                mgr = User.objects(id=wh.manager_id).first()
                d['manager_name'] = mgr.full_name or mgr.username if mgr else "Unassigned"
            else:
                d['manager_name'] = "Unassigned"
            data.append(d)

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can create warehouses'}, status=status.HTTP_403_FORBIDDEN)

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
        return Response(wh.to_dict(), status=status.HTTP_201_CREATED)


class WarehouseDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get_object(self, pk):
        return Warehouse.objects(id=pk).first()

    def get(self, request, pk):
        wh = self.get_object(pk)
        if not wh:
            return Response({'error': 'Warehouse not found'}, status=status.HTTP_404_NOT_FOUND)
        
        d = wh.to_dict()
        stocks = Stock.objects(warehouse_id=str(wh.id))
        d['current_stock_qty'] = sum(s.quantity for s in stocks)
        d['capacity_usage_pct'] = round((d['current_stock_qty'] / wh.capacity) * 100, 1) if wh.capacity > 0 else 0
        return Response(d, status=status.HTTP_200_OK)

    def put(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can modify warehouse configuration'}, status=status.HTTP_403_FORBIDDEN)

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
        return Response(wh.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can delete warehouses'}, status=status.HTTP_403_FORBIDDEN)

        wh = self.get_object(pk)
        if not wh:
            return Response({'error': 'Warehouse not found'}, status=status.HTTP_404_NOT_FOUND)
        wh.delete()
        return Response({'message': 'Warehouse deleted successfully'}, status=status.HTTP_200_OK)
