from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAdminUserRole
from api.models import User, Warehouse

class UserListCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        users = User.objects()
        data = []
        for u in users:
            d = u.to_dict()
            if u.assigned_warehouse_id:
                wh = Warehouse.objects(id=u.assigned_warehouse_id).first()
                d['assigned_warehouse_name'] = wh.name if wh else "N/A"
            else:
                d['assigned_warehouse_name'] = "System Wide (All)"
            data.append(d)
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role', 'WarehouseManager')
        full_name = request.data.get('full_name', '')
        assigned_warehouse_id = request.data.get('assigned_warehouse_id')
        is_temp_admin = bool(request.data.get('is_temporary_admin', False))
        temp_hours = int(request.data.get('temp_admin_duration_hours', 24))

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects(username=username).first():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if is_temp_admin:
            role = 'Admin'

        if role == 'Admin' and not is_temp_admin and User.objects(role='Admin', is_temporary_admin=False).count() >= 2:
            return Response({'error': 'Maximum 2 permanent Admin accounts allowed during handoff.'}, status=status.HTTP_400_BAD_REQUEST)

        admin_expires_at = None
        if is_temp_admin:
            import datetime
            admin_expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=temp_hours)

        user = User(
            username=username,
            full_name=full_name,
            role=role,
            assigned_warehouse_id=assigned_warehouse_id if assigned_warehouse_id else None,
            is_temporary_admin=is_temp_admin,
            admin_expires_at=admin_expires_at
        )
        user.set_password(password)
        user.save()

        return Response(user.to_dict(), status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get_object(self, pk):
        return User.objects(id=pk).first()

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(user.to_dict(), status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'role' in request.data and request.data['role'] == 'Admin' and user.role != 'Admin':
            if User.objects(role='Admin', is_temporary_admin=False).count() >= 2:
                return Response({'error': 'Maximum 2 permanent Admin accounts allowed during handoff.'}, status=status.HTTP_400_BAD_REQUEST)

        if 'full_name' in request.data:
            user.full_name = request.data['full_name']
        if 'role' in request.data:
            user.role = request.data['role']
        if 'assigned_warehouse_id' in request.data:
            user.assigned_warehouse_id = request.data['assigned_warehouse_id'] if request.data['assigned_warehouse_id'] else None
        if 'is_active' in request.data:
            user.is_active = bool(request.data['is_active'])
        if 'is_temporary_admin' in request.data:
            user.is_temporary_admin = bool(request.data['is_temporary_admin'])
            if user.is_temporary_admin:
                user.role = 'Admin'
                temp_hours = int(request.data.get('temp_admin_duration_hours', 24))
                import datetime
                user.admin_expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=temp_hours)
            else:
                user.admin_expires_at = None
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])

        user.save()
        return Response(user.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.role == 'Admin':
            admin_count = User.objects(role='Admin').count()
            if admin_count <= 1:
                return Response({'error': 'Cannot delete the sole Admin account. You must first create another Admin user before deleting this account.'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'message': 'User permanently deleted from database successfully'}, status=status.HTTP_200_OK)
