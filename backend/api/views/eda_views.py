import random
import pandas as pd
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser
from api.models import Product, Stock, Sale, Supplier

class EDADashboardView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        try:
            user = request.user
            role = getattr(user, 'role', None)
            assigned_wh_id = user.assigned_warehouse_id if (role not in ['Founder', 'Admin'] and user.assigned_warehouse_id) else None

            if assigned_wh_id:
                stocks = list(Stock.objects(warehouse_id=assigned_wh_id))
                wh_pids = list(set(s.product_id for s in stocks))
                products = list(Product.objects(id__in=wh_pids)) if wh_pids else []
            else:
                products = list(Product.objects.all())

            suppliers = list(Supplier.objects.all())

            if not products:
                return Response({
                    "eda_module": "Pandas & Numpy Statistical EDA Analytics Engine",
                    "total_samples": 0,
                    "correlation_matrix": {},
                    "boxplot_summary": {},
                    "scatterplot_data": [],
                    "distribution_histograms": [],
                    "crosstab_matrix": {}
                }, status=status.HTTP_200_OK)

            df = pd.DataFrame([{
                "cost_price": float(p.cost_price or 0.0),
                "selling_price": float(p.selling_price or 0.0),
                "margin": float((p.selling_price or 0.0) - (p.cost_price or 0.0)),
                "min_stock": float(p.min_stock_level or 15),
                "reorder_point": float(p.reorder_point or 30)
            } for p in products])

            # 1. Correlation Matrix
            corr_matrix = df.corr().fillna(0).round(3).to_dict()

            # 2. Boxplot stats for Selling Price & Cost Price
            def get_boxplot(series):
                if series.empty or series.nunique() == 0:
                    return {"min": 0, "q1": 0, "median": 0, "q3": 0, "max": 0}
                q1 = float(series.quantile(0.25))
                med = float(series.median())
                q3 = float(series.quantile(0.75))
                iqr = q3 - q1
                s_min = series.min()
                s_max = series.max()
                min_val = float(s_min) if pd.notnull(s_min) else 0.0
                max_val = float(s_max) if pd.notnull(s_max) else 0.0
                return {
                    "min": round(float(max(min_val, q1 - 1.5 * iqr)), 2),
                    "q1": round(q1, 2),
                    "median": round(med, 2),
                    "q3": round(q3, 2),
                    "max": round(float(min(max_val, q3 + 1.5 * iqr)), 2)
                }

            boxplot_data = {
                "cost_price": get_boxplot(df['cost_price']),
                "selling_price": get_boxplot(df['selling_price']),
                "margin": get_boxplot(df['margin'])
            }

            # 3. Scatterplot points (Cost Price vs Selling Price)
            scatter_points = df[['cost_price', 'selling_price']].head(40).to_dict(orient='records')

            # 4. Distribution Histogram Bins for Selling Price
            hist, bin_edges = np.histogram(df['selling_price'], bins=6)
            dist_bins = [
                {"bin": f"₹{int(bin_edges[i])}-₹{int(bin_edges[i+1])}", "count": int(hist[i])}
                for i in range(len(hist))
            ]

            # 5. Crosstab (Category vs Supplier Lead Time Buckets)
            sup_lead_map = {str(s.id): (s.lead_time_days if getattr(s, 'lead_time_days', None) is not None else 7.0) for s in suppliers}
            crosstab_df = pd.DataFrame([{
                "category": p.category_id or "General",
                "lead_bucket": "Fast (<5 days)" if sup_lead_map.get(str(p.supplier_id), 7.0) <= 5 else "Normal (>=5 days)"
            } for p in products])

            crosstab = pd.crosstab(crosstab_df['category'], crosstab_df['lead_bucket']).to_dict()

            return Response({
                "eda_module": "Pandas & Numpy Statistical EDA Analytics Engine",
                "total_samples": len(df),
                "correlation_matrix": corr_matrix,
                "boxplot_summary": boxplot_data,
                "scatterplot_data": scatter_points,
                "distribution_histograms": dist_bins,
                "crosstab_matrix": crosstab
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": f"EDA processing error: {str(e)}",
                "eda_module": "Pandas & Numpy Statistical EDA Analytics Engine",
                "total_samples": 0,
                "correlation_matrix": {},
                "boxplot_summary": {},
                "scatterplot_data": [],
                "distribution_histograms": [],
                "crosstab_matrix": {}
            }, status=status.HTTP_200_OK)
