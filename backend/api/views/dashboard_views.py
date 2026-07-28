from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser
from api.models import Product, Stock, Sale, Supplier, Warehouse, PurchaseOrder, User, Category


class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        role = user.role
        assigned_wh_id = user.assigned_warehouse_id if (role != 'Admin' and user.assigned_warehouse_id) else None

        # Base counts
        total_products_count = Product.objects.count()
        total_warehouses_count = Warehouse.objects.count()
        total_suppliers_count = Supplier.objects.count()
        total_users_count = User.objects.count()
        total_categories_count = Category.objects.count()

        # Filter by warehouse scope if assigned
        if assigned_wh_id:
            stocks = Stock.objects(warehouse_id=assigned_wh_id)
            wh_sales = Sale.objects(warehouse_id=assigned_wh_id)
            wh_pos = PurchaseOrder.objects(warehouse_id=assigned_wh_id)
        else:
            stocks = Stock.objects.all()
            wh_sales = Sale.objects.all()
            wh_pos = PurchaseOrder.objects.all()

        total_sales_count = wh_sales.count()
        total_po_count = wh_pos.count()
        total_stock_units = sum(s.quantity for s in stocks)
        total_revenue = sum(s.total_amount for s in wh_sales)

        # Calculate Low Stock items & Count
        low_stock_items = []
        low_stock_count = 0
        all_products = list(Product.objects.all())

        for p in all_products:
            if assigned_wh_id:
                st = Stock.objects(product_id=str(p.id), warehouse_id=assigned_wh_id).first()
                current_qty = st.quantity if st else 0
            else:
                p_stocks = Stock.objects(product_id=str(p.id))
                current_qty = sum(s.quantity for s in p_stocks)

            min_level = p.min_stock_level or 15
            if current_qty <= min_level:
                low_stock_count += 1
                sup = Supplier.objects(id=p.supplier_id).first()
                low_stock_items.append({
                    "product_id": str(p.id),
                    "product_name": p.name,
                    "sku": p.sku,
                    "unit": p.unit,
                    "current_stock": current_qty,
                    "min_stock_level": min_level,
                    "reorder_point": p.reorder_point or 30,
                    "supplier_name": sup.name if sup else "No Supplier Assigned"
                })

        # Calculate Sales Highlights (Most Sold, Top Revenue, Best Warehouse, Fast Category)
        prod_stats = {}
        wh_stats = {}
        cat_stats = {}

        for s in wh_sales:
            w_id = s.warehouse_id
            wh_stats[w_id] = wh_stats.get(w_id, 0.0) + s.total_amount

            for item in s.items:
                p_id = item.product_id
                if p_id not in prod_stats:
                    p_obj = Product.objects(id=p_id).first()
                    cat_id = p_obj.category_id if p_obj else None
                    prod_stats[p_id] = {
                        'name': item.product_name,
                        'qty': 0,
                        'revenue': 0.0,
                        'category_id': cat_id
                    }
                prod_stats[p_id]['qty'] += item.quantity
                prod_stats[p_id]['revenue'] += item.total

                c_id = prod_stats[p_id]['category_id']
                if c_id:
                    cat_stats[c_id] = cat_stats.get(c_id, 0) + item.quantity

        most_sold = max(prod_stats.values(), key=lambda x: x['qty']) if prod_stats else {"name": "No Sales Recorded Yet", "qty": 0}
        highest_revenue_prod = max(prod_stats.values(), key=lambda x: x['revenue']) if prod_stats else {"name": "No Sales Recorded Yet", "revenue": 0.0}

        best_wh_name = "No Warehouse Sales Yet"
        best_wh_rev = 0.0
        if wh_stats:
            top_wh_id = max(wh_stats, key=wh_stats.get)
            top_wh = Warehouse.objects(id=top_wh_id).first()
            if top_wh:
                best_wh_name = top_wh.name
                best_wh_rev = wh_stats[top_wh_id]

        fast_cat_name = "No Category Sales Yet"
        if cat_stats:
            top_cat_id = max(cat_stats, key=cat_stats.get)
            top_cat = Category.objects(id=top_cat_id).first()
            if top_cat:
                fast_cat_name = top_cat.name

        # Recent Sales (Top 5)
        recent_sales = []
        for s in wh_sales.order_by('-created_at')[:5]:
            recent_sales.append({
                "id": str(s.id),
                "invoice_number": s.invoice_number,
                "customer_name": s.customer_name or "Direct Order Customer",
                "total_amount": s.total_amount,
                "created_at": s.created_at.isoformat() if s.created_at else None
            })

        # Recent Purchase Orders (Top 5)
        recent_pos = []
        for po in wh_pos.order_by('-created_at')[:5]:
            sup = Supplier.objects(id=po.supplier_id).first()
            recent_pos.append({
                "id": str(po.id),
                "po_number": po.po_number,
                "supplier_name": sup.name if sup else "Direct Supplier",
                "total_amount": po.total_amount,
                "status": po.status,
                "created_at": po.created_at.isoformat() if po.created_at else None
            })

        # Live Sidebar Menu Counts
        sidebar_counts = {
            "inventory": total_stock_units,
            "products": total_products_count,
            "warehouses": total_warehouses_count,
            "suppliers": total_suppliers_count,
            "purchase_orders": total_po_count,
            "sales": total_sales_count,
            "reports": 12,
            "users": total_users_count
        }

        return Response({
            "summary_kpis": {
                "total_revenue": round(total_revenue, 2),
                "total_products": total_products_count,
                "total_inventory": total_stock_units,
                "total_warehouses": total_warehouses_count,
                "total_suppliers": total_suppliers_count,
                "total_purchase_orders": total_po_count,
                "total_sales_orders": total_sales_count,
                "total_users": total_users_count,
                "low_stock_count": low_stock_count,
                "ai_alerts_count": low_stock_count
            },
            "sidebar_counts": sidebar_counts,
            "best_selling_product": most_sold,
            "highest_revenue_product": highest_revenue_prod,
            "best_warehouse": {"name": best_wh_name, "revenue": round(best_wh_rev, 2)},
            "fast_moving_category": fast_cat_name,
            "low_stock_items": low_stock_items[:10],
            "recent_sales": recent_sales,
            "recent_purchase_orders": recent_pos
        }, status=status.HTTP_200_OK)


class SidebarCountsView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        role = user.role
        assigned_wh_id = user.assigned_warehouse_id if (role != 'Admin' and user.assigned_warehouse_id) else None

        if assigned_wh_id:
            stocks = Stock.objects(warehouse_id=assigned_wh_id)
            wh_sales = Sale.objects(warehouse_id=assigned_wh_id)
            wh_pos = PurchaseOrder.objects(warehouse_id=assigned_wh_id)
        else:
            stocks = Stock.objects.all()
            wh_sales = Sale.objects.all()
            wh_pos = PurchaseOrder.objects.all()

        counts = {
            "inventory": sum(s.quantity for s in stocks),
            "products": Product.objects.count(),
            "warehouses": Warehouse.objects.count(),
            "suppliers": Supplier.objects.count(),
            "purchase_orders": wh_pos.count(),
            "sales": wh_sales.count(),
            "reports": 12,
            "users": User.objects.count()
        }
        return Response(counts, status=status.HTTP_200_OK)
