import csv
import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import CanAccessReports
from api.models import Product, Stock, Sale, Warehouse, Supplier

class CSVExportView(APIView):
    permission_classes = [CanAccessReports]

    def get(self, request, report_type):
        user = request.user
        role = getattr(user, 'role', None)

        # Check role report permissions
        allowed_map = {
            'Founder': ['inventory', 'sales', 'suppliers'],
            'Admin': ['inventory', 'sales', 'suppliers'],
            'WarehouseManager': ['inventory', 'sales', 'suppliers'],
            'InventoryManager': ['inventory', 'sales', 'suppliers'],
            'StockManager': ['inventory', 'sales', 'suppliers'],
            'PurchaseManager': ['inventory', 'sales', 'suppliers'],
            'SalesManager': ['inventory', 'sales', 'suppliers'],
            'WarehouseEmployee': ['inventory'],
        }

        user_allowed = allowed_map.get(role, [])
        if report_type not in user_allowed:
            return Response({'error': f'Your role ({role}) does not have permission to access {report_type} reports'}, status=status.HTTP_403_FORBIDDEN)

        buffer = io.StringIO()
        writer = csv.writer(buffer)

        if report_type == 'inventory':
            writer.writerow(['Product Name', 'SKU', 'Category', 'Warehouse', 'Current Stock', 'Min Threshold', 'Unit Cost ($)', 'Total Value ($)', 'Status'])
            stocks = Stock.objects()
            for s in stocks:
                if role not in ['Founder', 'Admin', 'InventoryManager'] and str(user.assigned_warehouse_id) != str(s.warehouse_id):
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
                if role not in ['Founder', 'Admin', 'SalesManager'] and str(user.assigned_warehouse_id) != str(s.warehouse_id):
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


class ReportPDFExportView(APIView):
    permission_classes = [CanAccessReports]

    def get(self, request, report_type):
        user = request.user
        role = getattr(user, 'role', None)

        allowed_map = {
            'Founder': ['inventory', 'sales', 'suppliers'],
            'Admin': ['inventory', 'sales', 'suppliers'],
            'WarehouseManager': ['inventory', 'sales', 'suppliers'],
            'InventoryManager': ['inventory', 'sales', 'suppliers'],
            'StockManager': ['inventory', 'sales', 'suppliers'],
            'PurchaseManager': ['inventory', 'sales', 'suppliers'],
            'SalesManager': ['inventory', 'sales', 'suppliers'],
            'WarehouseEmployee': ['inventory'],
        }

        user_allowed = allowed_map.get(role, [])
        if report_type not in user_allowed:
            return Response({'error': f'Your role ({role}) does not have permission to access {report_type} PDF reports'}, status=status.HTTP_403_FORBIDDEN)

        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas

            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            p.setFont("Helvetica-Bold", 16)
            p.drawString(50, 750, f"SupplySense ERP - {report_type.upper()} REPORT")
            p.setFont("Helvetica", 10)
            p.drawString(50, 735, f"Generated for: {user.username} ({role}) | Date: 2026-08-02")
            p.setLineWidth(1)
            p.line(50, 725, 550, 725)

            y = 700
            p.setFont("Helvetica-Bold", 10)

            if report_type == 'inventory':
                p.drawString(50, y, "PRODUCT NAME")
                p.drawString(220, y, "SKU")
                p.drawString(320, y, "STOCK")
                p.drawString(400, y, "UNIT COST")
                p.drawString(480, y, "STATUS")
                y -= 15
                p.setFont("Helvetica", 9)
                stocks = Stock.objects()[:25]
                for s in stocks:
                    prod = Product.objects(id=s.product_id).first()
                    if not prod:
                        continue
                    p.drawString(50, y, prod.name[:25])
                    p.drawString(220, y, prod.sku)
                    p.drawString(320, y, f"{s.quantity} {prod.unit}")
                    p.drawString(400, y, f"Rs.{prod.cost_price}")
                    st_label = "LOW" if s.quantity <= prod.min_stock_level else "OK"
                    p.drawString(480, y, st_label)
                    y -= 18
                    if y < 50:
                        p.showPage()
                        y = 750

            elif report_type == 'sales':
                p.drawString(50, y, "INVOICE #")
                p.drawString(180, y, "CUSTOMER")
                p.drawString(340, y, "ITEMS")
                p.drawString(420, y, "TOTAL AMOUNT")
                y -= 15
                p.setFont("Helvetica", 9)
                sales = Sale.objects()[:25]
                for s in sales:
                    p.drawString(50, y, s.invoice_number)
                    p.drawString(180, y, (s.customer_name or 'Walk-in')[:22])
                    p.drawString(340, y, f"{len(s.items)} Items")
                    p.drawString(420, y, f"Rs.{s.total_amount:,.2f}")
                    y -= 18
                    if y < 50:
                        p.showPage()
                        y = 750

            elif report_type == 'suppliers':
                p.drawString(50, y, "SUPPLIER NAME")
                p.drawString(220, y, "CODE")
                p.drawString(300, y, "LEAD TIME")
                p.drawString(380, y, "DEFECT %")
                p.drawString(460, y, "SCORE")
                y -= 15
                p.setFont("Helvetica", 9)
                suppliers = Supplier.objects()[:25]
                for sup in suppliers:
                    p.drawString(50, y, sup.name[:24])
                    p.drawString(220, y, sup.code)
                    p.drawString(300, y, f"{sup.lead_time_days} days")
                    p.drawString(380, y, f"{(sup.defect_rate*100):.1f}%")
                    p.drawString(460, y, f"{sup.reliability_score}%")
                    y -= 18
                    if y < 50:
                        p.showPage()
                        y = 750

            p.save()
            pdf = buffer.getvalue()
            buffer.close()
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{report_type}_report.pdf"'
            return response
        except Exception as e:
            return Response({'error': f'PDF Generation Failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

