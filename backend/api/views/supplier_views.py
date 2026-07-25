from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser, IsAdminUserRole
from api.models import Supplier

class SupplierListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        suppliers = Supplier.objects()
        return Response([s.to_dict() for s in suppliers], status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can register suppliers'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name')
        code = request.data.get('code')
        contact_person = request.data.get('contact_person', '')
        email = request.data.get('email', '')
        phone = request.data.get('phone', '')
        lead_time_days = float(request.data.get('lead_time_days', 7.0))
        defect_rate = float(request.data.get('defect_rate', 0.02))
        fulfillment_rate = float(request.data.get('fulfillment_rate', 0.95))

        if not name or not code:
            return Response({'error': 'Supplier name and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate initial reliability score
        score = (fulfillment_rate * 50.0) + (max(0, 14 - lead_time_days) / 14.0 * 30.0) + (max(0, 0.1 - defect_rate) / 0.1 * 20.0)
        reliability_score = round(min(100.0, max(0.0, score)), 1)

        sup = Supplier(
            name=name,
            code=code,
            contact_person=contact_person,
            email=email,
            phone=phone,
            address=request.data.get('address', ''),
            lead_time_days=lead_time_days,
            defect_rate=defect_rate,
            fulfillment_rate=fulfillment_rate,
            reliability_score=reliability_score
        )
        sup.save()
        return Response(sup.to_dict(), status=status.HTTP_201_CREATED)


class SupplierDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get_object(self, pk):
        return Supplier.objects(id=pk).first()

    def get(self, request, pk):
        sup = self.get_object(pk)
        if not sup:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(sup.to_dict(), status=status.HTTP_200_OK)

    def put(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can update supplier details'}, status=status.HTTP_403_FORBIDDEN)

        sup = self.get_object(pk)
        if not sup:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)

        for field in ['name', 'contact_person', 'email', 'phone', 'address', 'status']:
            if field in request.data:
                setattr(sup, field, request.data[field])

        if 'lead_time_days' in request.data:
            sup.lead_time_days = float(request.data['lead_time_days'])
        if 'defect_rate' in request.data:
            sup.defect_rate = float(request.data['defect_rate'])
        if 'fulfillment_rate' in request.data:
            sup.fulfillment_rate = float(request.data['fulfillment_rate'])

        # Recalculate reliability score
        score = (sup.fulfillment_rate * 50.0) + (max(0, 14 - sup.lead_time_days) / 14.0 * 30.0) + (max(0, 0.1 - sup.defect_rate) / 0.1 * 20.0)
        sup.reliability_score = round(min(100.0, max(0.0, score)), 1)
        sup.save()

        return Response(sup.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can delete suppliers'}, status=status.HTTP_403_FORBIDDEN)

        sup = self.get_object(pk)
        if not sup:
            return Response({'error': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
        sup.delete()
        return Response({'message': 'Supplier deleted successfully'}, status=status.HTTP_200_OK)
