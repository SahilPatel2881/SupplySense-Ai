import datetime
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import CanAccessSales
from api.models import Sale, SaleItem, Product, Stock, StockMovement, Warehouse, Notification
from api.services.pdf_generator import PDFGenerator

class SalesListCreateView(APIView):
    permission_classes = [CanAccessSales]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', None)

        req_wh_id = request.query_params.get('warehouse_id')
        if role in ['Founder', 'Admin']:
            assigned_wh_id = req_wh_id if (req_wh_id and req_wh_id != 'ALL') else None
        else:
            assigned_wh_id = str(user.assigned_warehouse_id) if getattr(user, 'assigned_warehouse_id', None) else None

        if assigned_wh_id:
            sales = Sale.objects(warehouse_id=assigned_wh_id).order_by('-created_at')
        else:
            sales = Sale.objects().order_by('-created_at')

        data = []
        for s in sales:
            d = s.to_dict()
            wh = Warehouse.objects(id=s.warehouse_id).first()
            d['warehouse_name'] = wh.name if wh else "N/A"
            data.append(d)

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        role = getattr(user, 'role', None)
        warehouse_id = request.data.get('warehouse_id')
        customer_name = request.data.get('customer_name', 'Walk-in Customer')
        raw_items = request.data.get('items', [])

        if not warehouse_id or not raw_items:
            return Response({'error': 'Warehouse and items list required'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in ['Founder', 'Admin', 'SalesManager'] and str(user.assigned_warehouse_id) != str(warehouse_id):
            return Response({'error': 'You can only record sales for your assigned warehouse'}, status=status.HTTP_403_FORBIDDEN)

        sale_items = []
        total_amount = 0.0
        stocks_to_update = []

        for it in raw_items:
            prod_id = it.get('product_id')
            qty = int(it.get('quantity', 1))
            prod = Product.objects(id=prod_id).first()
            if not prod:
                return Response({'error': f'Product ID {prod_id} not found'}, status=status.HTTP_400_BAD_REQUEST)

            stock = Stock.objects(product_id=prod_id, warehouse_id=warehouse_id).first()
            if not stock or stock.quantity < qty:
                return Response({'error': f'Insufficient stock for product "{prod.name}". Available: {stock.quantity if stock else 0}'}, status=status.HTTP_400_BAD_REQUEST)

            unit_price = float(it.get('unit_price', prod.selling_price))
            subtotal = round(qty * unit_price, 2)
            total_amount += subtotal

            sale_items.append(SaleItem(
                product_id=str(prod.id),
                product_name=prod.name,
                quantity=qty,
                unit_price=unit_price,
                total=subtotal
            ))
            stocks_to_update.append((stock, qty, prod))

        inv_num = f"INV-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        for stock, qty, prod in stocks_to_update:
            stock.quantity -= qty
            stock.last_updated = datetime.datetime.utcnow()
            stock.save()

            StockMovement(
                movement_type='OUT',
                product_id=str(prod.id),
                source_warehouse_id=warehouse_id,
                quantity=qty,
                reference_doc=inv_num,
                note=f"Sale Invoice #{inv_num}",
                performed_by_id=user.id
            ).save()

            if stock.quantity <= prod.min_stock_level:
                Notification(
                    warehouse_id=warehouse_id,
                    title=f"Low Stock Alert: {prod.name}",
                    message=f"Product '{prod.name}' in warehouse is down to {stock.quantity} {prod.unit}.",
                    type='LOW_STOCK'
                ).save()

        sale = Sale(
            invoice_number=inv_num,
            warehouse_id=warehouse_id,
            customer_name=customer_name,
            items=sale_items,
            total_amount=round(total_amount, 2),
            payment_status='PAID',
            recorded_by_id=str(user.id)
        )
        sale.save()

        return Response(sale.to_dict(), status=status.HTTP_201_CREATED)


class InvoicePDFDownloadView(APIView):
    permission_classes = [CanAccessSales]

    def get(self, request, pk):
        sale = Sale.objects(id=pk).first()
        if not sale:
            return Response({'error': 'Sale record not found'}, status=status.HTTP_404_NOT_FOUND)

        wh = Warehouse.objects(id=sale.warehouse_id).first()
        wh_name = wh.name if wh else "Warehouse"

        pdf_bytes = PDFGenerator.generate_sales_invoice_pdf(sale.to_dict(), warehouse_name=wh_name)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{sale.invoice_number}.pdf"'
        return response
