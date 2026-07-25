from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser, IsAdminUserRole
from api.models import Category

class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        categories = Category.objects()
        return Response([c.to_dict() for c in categories], status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can create product categories'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name')
        code = request.data.get('code')
        description = request.data.get('description', '')

        if not name or not code:
            return Response({'error': 'Category name and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        if Category.objects(name=name).first() or Category.objects(code=code).first():
            return Response({'error': 'Category with this name or code already exists'}, status=status.HTTP_400_BAD_REQUEST)

        cat = Category(name=name, code=code, description=description)
        cat.save()
        return Response(cat.to_dict(), status=status.HTTP_201_CREATED)


class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get_object(self, pk):
        return Category.objects(id=pk).first()

    def get(self, request, pk):
        cat = self.get_object(pk)
        if not cat:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(cat.to_dict(), status=status.HTTP_200_OK)

    def put(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can modify categories'}, status=status.HTTP_403_FORBIDDEN)

        cat = self.get_object(pk)
        if not cat:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            cat.name = request.data['name']
        if 'description' in request.data:
            cat.description = request.data['description']

        cat.save()
        return Response(cat.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can delete categories'}, status=status.HTTP_403_FORBIDDEN)

        cat = self.get_object(pk)
        if not cat:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        cat.delete()
        return Response({'message': 'Category deleted successfully'}, status=status.HTTP_200_OK)
