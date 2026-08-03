import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import CanAccessPurchaseOrders, CanCreateOrApprovePO, CanReceivePO
from api.models import PurchaseOrder, POItem, Product, Supplier, Warehouse, Stock, StockMovement, Notification

class PurchaseOrderListCreateView(APIView):
    permission_classes = [CanAccessPurchaseOrders]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', None)

        req_wh_id = request.query_params.get('warehouse_id')
        if role in ['Founder', 'Admin']:
            assigned_wh_id = req_wh_id if (req_wh_id and req_wh_id != 'ALL') else None
        else:
            assigned_wh_id = str(user.assigned_warehouse_id) if getattr(user, 'assigned_warehouse_id', None) else None

        if assigned_wh_id:
            pos = PurchaseOrder.objects(warehouse_id=assigned_wh_id).order_by('-created_at')
        else:
            pos = PurchaseOrder.objects().order_by('-created_at')

        data = []
        for p in pos:
            d = p.to_dict()
            sup = Supplier.objects(id=p.supplier_id).first()
            wh = Warehouse.objects(id=p.warehouse_id).first()
            d['supplier_name'] = sup.name if sup else "N/A"
            d['warehouse_name'] = wh.name if wh else "N/A"
            data.append(d)

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        role = getattr(user, 'role', None)
        if role not in ['Founder', 'Admin', 'PurchaseManager']:
            return Response({'error': 'Only Founder, Admins, or Purchase Managers can create purchase orders'}, status=status.HTTP_403_FORBIDDEN)

        supplier_id = request.data.get('supplier_id')
        warehouse_id = request.data.get('warehouse_id')
        raw_items = request.data.get('items', [])

        if not supplier_id or not warehouse_id or not raw_items:
            return Response({'error': 'Supplier, Warehouse, and items list required'}, status=status.HTTP_400_BAD_REQUEST)

        po_items = []
        total_amount = 0.0
        for it in raw_items:
            prod = Product.objects(id=it.get('product_id')).first()
            qty = int(it.get('quantity', 1))
            unit_price = float(it.get('unit_price', prod.cost_price if prod else 0.0))
            subtotal = qty * unit_price
            total_amount += subtotal
            po_items.append(POItem(
                product_id=str(prod.id) if prod else it.get('product_id'),
                product_name=prod.name if prod else "Product",
                quantity=qty,
                unit_price=unit_price,
                total=subtotal
            ))

        po_num = f"PO-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        is_auto_approved = role in ['Founder', 'Admin', 'PurchaseManager']
        po = PurchaseOrder(
            po_number=po_num,
            supplier_id=supplier_id,
            warehouse_id=warehouse_id,
            items=po_items,
            total_amount=total_amount,
            status='APPROVED' if is_auto_approved else 'PENDING',
            created_by_id=str(user.id),
            approved_by_id=str(user.id) if is_auto_approved else None
        )
        po.save()

        if po.status == 'PENDING':
            Notification(
                title=f"New PO Pending Approval: {po_num}",
                message=f"Purchase Order {po_num} for ${total_amount:,.2f} requires approval.",
                type='PO_APPROVAL'
            ).save()

        return Response(po.to_dict(), status=status.HTTP_201_CREATED)


class PurchaseOrderApproveView(APIView):
    permission_classes = [CanCreateOrApprovePO]

    def post(self, request, pk):
        po = PurchaseOrder.objects(id=pk).first()
        if not po:
            return Response({'error': 'Purchase Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if po.status != 'PENDING':
            return Response({'error': f'PO cannot be approved in {po.status} status'}, status=status.HTTP_400_BAD_REQUEST)

        po.status = 'APPROVED'
        po.approved_by_id = str(request.user.id)
        po.updated_at = datetime.datetime.utcnow()
        po.save()

        return Response({'message': 'Purchase Order approved successfully', 'po': po.to_dict()}, status=status.HTTP_200_OK)


class PurchaseOrderReceiveView(APIView):
    permission_classes = [CanReceivePO]

    def post(self, request, pk):
        user = request.user
        role = getattr(user, 'role', None)
        po = PurchaseOrder.objects(id=pk).first()
        if not po:
            return Response({'error': 'Purchase Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if po.status != 'APPROVED':
            return Response({'error': 'Only APPROVED Purchase Orders can be received into inventory'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in ['Founder', 'Admin', 'PurchaseManager'] and str(user.assigned_warehouse_id) != str(po.warehouse_id):
            return Response({'error': 'You can only receive POs for your assigned warehouse'}, status=status.HTTP_403_FORBIDDEN)

        # Receive items into stock
        for item in po.items:
            stock = Stock.objects(product_id=item.product_id, warehouse_id=po.warehouse_id).first()
            if not stock:
                stock = Stock(product_id=item.product_id, warehouse_id=po.warehouse_id, quantity=0)

            stock.quantity += item.quantity
            stock.last_updated = datetime.datetime.utcnow()
            stock.save()

            StockMovement(
                movement_type='IN',
                product_id=item.product_id,
                target_warehouse_id=po.warehouse_id,
                quantity=item.quantity,
                reference_doc=po.po_number,
                note=f"Received PO #{po.po_number}",
                performed_by_id=user.id
            ).save()

        po.status = 'RECEIVED'
        po.updated_at = datetime.datetime.utcnow()
        po.save()

        return Response({'message': f'Successfully received PO {po.po_number} into warehouse inventory', 'po': po.to_dict()}, status=status.HTTP_200_OK)


class OrderStatusFlowView(APIView):
    permission_classes = [CanAccessPurchaseOrders]

    def post(self, request, pk):
        po = PurchaseOrder.objects(id=pk).first()
        if not po:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        target_status = request.data.get('status')
        valid_transitions = ['PENDING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'APPROVED', 'RECEIVED', 'DRAFT']

        if target_status not in valid_transitions:
            return Response({'error': f'Invalid status transition: {target_status}'}, status=status.HTTP_400_BAD_REQUEST)

        po.status = target_status
        po.updated_at = datetime.datetime.utcnow()
        po.save()

        return Response({
            'message': f'Order {po.po_number} status updated to {target_status}',
            'po': po.to_dict()
        }, status=status.HTTP_200_OK)
