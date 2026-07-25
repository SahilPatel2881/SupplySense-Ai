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
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'WarehouseManager')
        full_name = request.data.get('full_name', '')
        assigned_warehouse_id = request.data.get('assigned_warehouse_id')

        if not username or not email or not password:
            return Response({'error': 'Username, email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects(username=username).first():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects(email=email).first():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User(
            username=username,
            email=email,
            full_name=full_name,
            role=role,
            assigned_warehouse_id=assigned_warehouse_id if assigned_warehouse_id else None
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

        if 'full_name' in request.data:
            user.full_name = request.data['full_name']
        if 'role' in request.data:
            user.role = request.data['role']
        if 'assigned_warehouse_id' in request.data:
            user.assigned_warehouse_id = request.data['assigned_warehouse_id'] if request.data['assigned_warehouse_id'] else None
        if 'is_active' in request.data:
            user.is_active = bool(request.data['is_active'])
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])

        user.save()
        return Response(user.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
