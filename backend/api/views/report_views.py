import csv
import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser
from api.models import Product, Stock, Sale, Warehouse, Supplier

class CSVExportView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, report_type):
        user = request.user
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        if report_type == 'inventory':
            writer.writerow(['Product Name', 'SKU', 'Category', 'Warehouse', 'Current Stock', 'Min Threshold', 'Unit Cost ($)', 'Total Value ($)', 'Status'])
            stocks = Stock.objects()
            for s in stocks:
                if user.role != 'Admin' and str(user.assigned_warehouse_id) != str(s.warehouse_id):
                    continue
                prod = Product.objects(id=s.product_id).first()
                wh = Warehouse.objects(id=s.warehouse_id).first()
                if not prod or not wh:
                    continue
                total_val = round(s.quantity * prod.cost_price, 2)
                st_label = "LOW STOCK" if s.quantity <= prod.min_stock_level else "OK"
                writer.writerow([prod.name, prod.sku, prod.category_id, wh.name, s.quantity, prod.min_stock_level, prod.cost_price, total_val, st_label])
            filename = "Inventory_Valuation_Report.csv"

        elif report_type == 'sales':
            writer.writerow(['Invoice #', 'Warehouse', 'Customer', 'Items Count', 'Total Amount ($)', 'Payment Status', 'Date'])
            sales = Sale.objects()
            for s in sales:
                if user.role != 'Admin' and str(user.assigned_warehouse_id) != str(s.warehouse_id):
                    continue
                wh = Warehouse.objects(id=s.warehouse_id).first()
                writer.writerow([s.invoice_number, wh.name if wh else "N/A", s.customer_name, len(s.items), s.total_amount, s.payment_status, str(s.created_at)[:10]])
            filename = "Sales_Summary_Report.csv"

        elif report_type == 'suppliers':
            writer.writerow(['Supplier Name', 'Code', 'Contact Person', 'Lead Time (Days)', 'Defect Rate (%)', 'Fulfillment Rate (%)', 'Reliability Score (0-100)', 'Status'])
            suppliers = Supplier.objects()
            for sup in suppliers:
                writer.writerow([sup.name, sup.code, sup.contact_person, sup.lead_time_days, round(sup.defect_rate * 100, 1), round(sup.fulfillment_rate * 100, 1), sup.reliability_score, sup.status])
            filename = "Supplier_Reliability_Report.csv"

        else:
            return Response({'error': 'Invalid report type'}, status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
