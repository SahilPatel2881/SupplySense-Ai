import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFGenerator:
    @staticmethod
    def generate_sales_invoice_pdf(sale_dict, warehouse_name="Central Warehouse"):
        """Generates an executive PDF invoice bytes buffer for a Sale record."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#1E293B'), # Navy dark
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'InvoiceSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )

        elements.append(Paragraph("<b>SupplySense AI - Sales Invoice</b>", title_style))
        elements.append(Paragraph(f"Invoice #: {sale_dict.get('invoice_number')} | Date: {sale_dict.get('created_at', '')[:10]} | Warehouse: {warehouse_name}", subtitle_style))
        elements.append(Spacer(1, 10))

        # Customer Info
        cust_info = [
            [Paragraph("<b>Customer Name:</b>", styles['Normal']), Paragraph(sale_dict.get('customer_name', 'Walk-in Customer'), styles['Normal'])],
            [Paragraph("<b>Payment Status:</b>", styles['Normal']), Paragraph(sale_dict.get('payment_status', 'PAID'), styles['Normal'])]
        ]
        info_table = Table(cust_info, colWidths=[120, 400])
        info_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))

        # Items Table
        table_data = [["Product", "Qty", "Unit Price ($)", "Total ($)"]]
        for item in sale_dict.get('items', []):
            table_data.append([
                item.get('product_name', 'Product'),
                str(item.get('quantity', 1)),
                f"${item.get('unit_price', 0.0):,.2f}",
                f"${item.get('total', 0.0):,.2f}"
            ])
        table_data.append(["", "", "Grand Total:", f"${sale_dict.get('total_amount', 0.0):,.2f}"])

        items_table = Table(table_data, colWidths=[240, 80, 100, 100])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')), # Dark navy header
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -2), 0.5, colors.HexColor('#E2E8F0')),
            ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (2, -1), (-1, -1), colors.HexColor('#0F172A')),
        ]))
        elements.append(items_table)

        elements.append(Spacer(1, 30))
        elements.append(Paragraph("<i>Thank you for your business! Powered by SupplySense AI.</i>", subtitle_style))

        doc.build(elements)
        pdf_value = buffer.getvalue()
        buffer.close()
        return pdf_value
