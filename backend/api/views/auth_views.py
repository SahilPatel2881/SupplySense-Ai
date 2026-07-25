from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import User, Warehouse

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup user by username or email
        user = User.objects(username=username, is_active=True).first()
        if not user:
            user = User.objects(email=username, is_active=True).first()

        if not user or not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT refresh and access tokens
        refresh = RefreshToken()
        refresh['user_id'] = str(user.id)
        refresh['username'] = user.username
        refresh['role'] = user.role

        user_dict = user.to_dict()
        warehouse_name = "System Wide (All)"
        if user.assigned_warehouse_id:
            wh = Warehouse.objects(id=user.assigned_warehouse_id).first()
            if wh:
                warehouse_name = wh.name
        user_dict['assigned_warehouse_name'] = warehouse_name

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_dict
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user.mongo_user
        user_dict = user.to_dict()
        warehouse_name = "System Wide (All)"
        if user.assigned_warehouse_id:
            wh = Warehouse.objects(id=user.assigned_warehouse_id).first()
            if wh:
                warehouse_name = wh.name
        user_dict['assigned_warehouse_name'] = warehouse_name
        return Response(user_dict, status=status.HTTP_200_OK)
