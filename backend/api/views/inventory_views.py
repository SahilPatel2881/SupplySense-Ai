import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser, IsAdminUserRole
from api.models import Stock, StockMovement, Product, Warehouse, Notification

class StockInView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        warehouse_id = request.data.get('warehouse_id')
        quantity = int(request.data.get('quantity', 0))
        reference_doc = request.data.get('reference_doc', 'Stock In')
        note = request.data.get('note', '')

        if not product_id or not warehouse_id or quantity <= 0:
            return Response({'error': 'Valid product_id, warehouse_id and quantity (> 0) required'}, status=status.HTTP_400_BAD_REQUEST)

        if user.role != 'Admin' and str(user.assigned_warehouse_id) != str(warehouse_id):
            return Response({'error': 'You can only manage stock in your assigned warehouse'}, status=status.HTTP_403_FORBIDDEN)

        stock = Stock.objects(product_id=product_id, warehouse_id=warehouse_id).first()
        if not stock:
            stock = Stock(product_id=product_id, warehouse_id=warehouse_id, quantity=0)

        stock.quantity += quantity
        stock.last_updated = datetime.datetime.utcnow()
        stock.save()

        # Log movement
        m = StockMovement(
            movement_type='IN',
            product_id=product_id,
            target_warehouse_id=warehouse_id,
            quantity=quantity,
            reference_doc=reference_doc,
            note=note,
            performed_by_id=user.id
        )
        m.save()

        return Response({'message': f'Successfully added {quantity} units to stock', 'stock': stock.to_dict()}, status=status.HTTP_200_OK)


class StockOutView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        warehouse_id = request.data.get('warehouse_id')
        quantity = int(request.data.get('quantity', 0))
        reference_doc = request.data.get('reference_doc', 'Stock Out')
        note = request.data.get('note', '')

        if not product_id or not warehouse_id or quantity <= 0:
            return Response({'error': 'Valid product_id, warehouse_id and quantity (> 0) required'}, status=status.HTTP_400_BAD_REQUEST)

        if user.role != 'Admin' and str(user.assigned_warehouse_id) != str(warehouse_id):
            return Response({'error': 'You can only manage stock in your assigned warehouse'}, status=status.HTTP_403_FORBIDDEN)

        stock = Stock.objects(product_id=product_id, warehouse_id=warehouse_id).first()
        if not stock or stock.quantity < quantity:
            return Response({'error': f'Insufficient stock. Current stock is {stock.quantity if stock else 0}'}, status=status.HTTP_400_BAD_REQUEST)

        stock.quantity -= quantity
        stock.last_updated = datetime.datetime.utcnow()
        stock.save()

        # Log movement
        m = StockMovement(
            movement_type='OUT',
            product_id=product_id,
            source_warehouse_id=warehouse_id,
            quantity=quantity,
            reference_doc=reference_doc,
            note=note,
            performed_by_id=user.id
        )
        m.save()

        # Low stock check trigger
        prod = Product.objects(id=product_id).first()
        if prod and stock.quantity <= prod.min_stock_level:
            Notification(
                warehouse_id=warehouse_id,
                title=f"Low Stock Alert: {prod.name}",
                message=f"Product '{prod.name}' in warehouse is down to {stock.quantity} {prod.unit}. (Min Threshold: {prod.min_stock_level})",
                type='LOW_STOCK'
            ).save()

        return Response({'message': f'Successfully deducted {quantity} units from stock', 'stock': stock.to_dict()}, status=status.HTTP_200_OK)


class StockTransferView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        source_warehouse_id = request.data.get('source_warehouse_id')
        target_warehouse_id = request.data.get('target_warehouse_id')
        quantity = int(request.data.get('quantity', 0))
        note = request.data.get('note', '')

        if not product_id or not source_warehouse_id or not target_warehouse_id or quantity <= 0:
            return Response({'error': 'Source warehouse, target warehouse, product and positive quantity required'}, status=status.HTTP_400_BAD_REQUEST)

        if source_warehouse_id == target_warehouse_id:
            return Response({'error': 'Source and target warehouses must be different'}, status=status.HTTP_400_BAD_REQUEST)

        if user.role != 'Admin' and str(user.assigned_warehouse_id) != str(source_warehouse_id):
            return Response({'error': 'You can only transfer stock out of your assigned warehouse'}, status=status.HTTP_403_FORBIDDEN)

        source_stock = Stock.objects(product_id=product_id, warehouse_id=source_warehouse_id).first()
        if not source_stock or source_stock.quantity < quantity:
            return Response({'error': f'Insufficient stock in source warehouse ({source_stock.quantity if source_stock else 0})'}, status=status.HTTP_400_BAD_REQUEST)

        target_stock = Stock.objects(product_id=product_id, warehouse_id=target_warehouse_id).first()
        if not target_stock:
            target_stock = Stock(product_id=product_id, warehouse_id=target_warehouse_id, quantity=0)

        # Deduct from source and add to target
        source_stock.quantity -= quantity
        source_stock.last_updated = datetime.datetime.utcnow()
        source_stock.save()

        target_stock.quantity += quantity
        target_stock.last_updated = datetime.datetime.utcnow()
        target_stock.save()

        # Log transfer movement
        m = StockMovement(
            movement_type='TRANSFER',
            product_id=product_id,
            source_warehouse_id=source_warehouse_id,
            target_warehouse_id=target_warehouse_id,
            quantity=quantity,
            reference_doc=f"TRF-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}",
            note=note,
            performed_by_id=user.id
        )
        m.save()

        return Response({'message': 'Stock transfer completed successfully'}, status=status.HTTP_200_OK)


class StockMovementListView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        movements = StockMovement.objects().order_by('-timestamp')[:100]
        data = []
        for m in movements:
            if user.role != 'Admin' and user.assigned_warehouse_id:
                if str(m.source_warehouse_id) != str(user.assigned_warehouse_id) and str(m.target_warehouse_id) != str(user.assigned_warehouse_id):
                    continue

            d = m.to_dict()
            prod = Product.objects(id=m.product_id).first()
            src_wh = Warehouse.objects(id=m.source_warehouse_id).first() if m.source_warehouse_id else None
            tgt_wh = Warehouse.objects(id=m.target_warehouse_id).first() if m.target_warehouse_id else None

            d['product_name'] = prod.name if prod else "N/A"
            d['product_sku'] = prod.sku if prod else "N/A"
            d['source_warehouse_name'] = src_wh.name if src_wh else "-"
            d['target_warehouse_name'] = tgt_wh.name if tgt_wh else "-"
            data.append(d)

        return Response(data, status=status.HTTP_200_OK)
