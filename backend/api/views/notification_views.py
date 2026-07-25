from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser
from api.models import Notification

class NotificationListView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        if user.role == 'Admin':
            notifications = Notification.objects().order_by('-created_at')[:50]
        else:
            # Show notifications for user's assigned warehouse or general alerts
            notifications = Notification.objects(warehouse_id=str(user.assigned_warehouse_id)).order_by('-created_at')[:50]

        return Response([n.to_dict() for n in notifications], status=status.HTTP_200_OK)

    def put(self, request, pk):
        n = Notification.objects(id=pk).first()
        if not n:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        n.is_read = True
        n.save()
        return Response(n.to_dict(), status=status.HTTP_200_OK)
