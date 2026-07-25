import numpy as np
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser, IsAdminUserRole
from api.models import Product, Stock, Sale, Supplier, Warehouse, Category
from api.services.ml_engine import MLEngine
from api.services.eda_engine import EDAEngine

class DemandForecastView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        model_type = request.query_params.get('model', 'random_forest')
        days_ahead = int(request.query_params.get('days', 30))

        # Query sales data
        sales = Sale.objects()
        sales_records = []
        for s in sales:
            for item in s.items:
                sales_records.append({
                    'created_at': s.created_at,
                    'quantity': item.quantity
                })

        if sales_records:
            df = pd.DataFrame(sales_records)
            df['date'] = pd.to_datetime(df['created_at']).dt.date
            daily = df.groupby('date')['quantity'].sum().reset_index()
            daily['day_index'] = np.arange(1, len(daily) + 1)
            daily.rename(columns={'quantity': 'sales_qty'}, inplace=True)
        else:
            daily = None

        result = MLEngine.forecast_demand(daily, model_type=model_type, forecast_days=days_ahead)
        return Response(result, status=status.HTTP_200_OK)


class SupplierReliabilityView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        model_type = request.query_params.get('model', 'random_forest')
        suppliers = Supplier.objects()
        
        sup_data = []
        for s in suppliers:
            # High risk condition
            high_risk = 1 if (s.lead_time_days > 10 or s.defect_rate > 0.04 or s.fulfillment_rate < 0.88) else 0
            sup_data.append({
                'lead_time_days': s.lead_time_days,
                'defect_rate': s.defect_rate,
                'fulfillment_rate': s.fulfillment_rate,
                'high_risk': high_risk
            })

        df = pd.DataFrame(sup_data) if len(sup_data) >= 5 else None
        result = MLEngine.evaluate_suppliers(df, model_type=model_type)
        return Response(result, status=status.HTTP_200_OK)


class LowStockPredictionView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        products = Product.objects()
        recommendations = []

        for p in products:
            sup = Supplier.objects(id=p.supplier_id).first()
            lead_time = sup.lead_time_days if sup else 7.0

            # Calculate stock quantity across relevant warehouses
            if user.role != 'Admin' and user.assigned_warehouse_id:
                st = Stock.objects(product_id=str(p.id), warehouse_id=str(user.assigned_warehouse_id)).first()
                current_qty = st.quantity if st else 0
            else:
                stocks = Stock.objects(product_id=str(p.id))
                current_qty = sum(s.quantity for s in stocks)

            # Estimate daily demand (default 5.0 units/day)
            daily_demand = max(2.0, p.min_stock_level / 4.0)

            rec = MLEngine.calculate_reorder_recommendation(
                daily_demand=daily_demand,
                lead_time_days=lead_time,
                current_stock=current_qty
            )
            rec['product_id'] = str(p.id)
            rec['product_name'] = p.name
            rec['sku'] = p.sku
            rec['unit'] = p.unit
            rec['min_stock_level'] = p.min_stock_level
            recommendations.append(rec)

        # Sort by low stock status first
        recommendations.sort(key=lambda x: x['is_low_stock'], reverse=True)
        return Response(recommendations, status=status.HTTP_200_OK)


class EDAAnalyticsView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        products_data = [p.to_dict() for p in Product.objects()]
        sales_data = [s.to_dict() for s in Sale.objects()]
        stocks_data = [st.to_dict() for st in Stock.objects()]
        suppliers_data = [sup.to_dict() for sup in Supplier.objects()]
        warehouses_data = [w.to_dict() for w in Warehouse.objects()]

        report = EDAEngine.generate_eda_report(
            products_data, sales_data, stocks_data, suppliers_data, warehouses_data
        )
        return Response(report, status=status.HTTP_200_OK)


class BusinessInsightsView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        sales = Sale.objects()
        
        # 1. Product Sales Velocity & Revenue
        prod_stats = {}
        wh_stats = {}
        
        for s in sales:
            wh_id = s.warehouse_id
            wh_stats[wh_id] = wh_stats.get(wh_id, 0.0) + s.total_amount

            for item in s.items:
                p_id = item.product_id
                if p_id not in prod_stats:
                    prod_stats[p_id] = {'name': item.product_name, 'qty': 0, 'revenue': 0.0}
                prod_stats[p_id]['qty'] += item.quantity
                prod_stats[p_id]['revenue'] += item.total

        # Most Sold & Highest Revenue Product
        most_sold = max(prod_stats.values(), key=lambda x: x['qty']) if prod_stats else {"name": "N/A", "qty": 0}
        highest_revenue = max(prod_stats.values(), key=lambda x: x['revenue']) if prod_stats else {"name": "N/A", "revenue": 0.0}

        # Best Warehouse by Revenue
        best_wh_name = "N/A"
        best_wh_rev = 0.0
        if wh_stats:
            top_wh_id = max(wh_stats, key=wh_stats.get)
            top_wh = Warehouse.objects(id=top_wh_id).first()
            if top_wh:
                best_wh_name = top_wh.name
                best_wh_rev = wh_stats[top_wh_id]

        # Fast Moving Category
        categories = Category.objects()
        fast_category = categories[0].name if categories else "General"

        return Response({
            "most_sold_product": most_sold,
            "highest_revenue_product": highest_revenue,
            "best_warehouse": {"name": best_wh_name, "revenue": best_wh_rev},
            "fast_moving_category": fast_category,
            "total_company_revenue": sum(s.total_amount for s in sales),
            "total_orders": len(sales)
        }, status=status.HTTP_200_OK)
