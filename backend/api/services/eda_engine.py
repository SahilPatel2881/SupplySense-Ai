class EDAEngine:
    @staticmethod
    def generate_eda_report(products_data, sales_data, stocks_data, suppliers_data, warehouses_data):
        """
        Executes comprehensive Pandas Exploratory Data Analysis (EDA)
        """
        import numpy as np
        import pandas as pd

        # Convert lists to DataFrames
        df_products = pd.DataFrame(products_data) if products_data else pd.DataFrame(columns=['id', 'name', 'cost_price', 'selling_price', 'category_id', 'supplier_id'])
        df_sales = pd.DataFrame(sales_data) if sales_data else pd.DataFrame(columns=['id', 'warehouse_id', 'total_amount', 'created_at'])
        df_stocks = pd.DataFrame(stocks_data) if stocks_data else pd.DataFrame(columns=['product_id', 'warehouse_id', 'quantity'])
        df_suppliers = pd.DataFrame(suppliers_data) if suppliers_data else pd.DataFrame(columns=['id', 'name', 'lead_time_days', 'defect_rate', 'fulfillment_rate', 'reliability_score'])
        df_warehouses = pd.DataFrame(warehouses_data) if warehouses_data else pd.DataFrame(columns=['id', 'name', 'capacity', 'location'])

        # 1. Data Cleaning
        df_products['cost_price'] = pd.to_numeric(df_products.get('cost_price', 0), errors='coerce').fillna(0)
        df_products['selling_price'] = pd.to_numeric(df_products.get('selling_price', 0), errors='coerce').fillna(0)
        df_products['margin'] = df_products['selling_price'] - df_products['cost_price']

        # 2. Merge & Concat Analysis (Merge Stock with Products & Warehouses)
        if not df_stocks.empty and not df_products.empty:
            merged_stock = pd.merge(df_stocks, df_products, left_on='product_id', right_on='id', how='left', suffixes=('', '_prod'))
            if not df_warehouses.empty:
                merged_stock = pd.merge(merged_stock, df_warehouses, left_on='warehouse_id', right_on='id', how='left', suffixes=('', '_wh'))
            merged_stock['inventory_value'] = merged_stock['quantity'] * merged_stock['cost_price']
        else:
            merged_stock = pd.DataFrame(columns=['quantity', 'inventory_value', 'name', 'name_wh'])

        # 3. GroupBy & Aggregation
        warehouse_agg = []
        if not merged_stock.empty and 'name_wh' in merged_stock.columns:
            wh_grouped = merged_stock.groupby('name_wh').agg(
                total_stock=('quantity', 'sum'),
                total_inventory_value=('inventory_value', 'sum'),
                product_count=('product_id', 'nunique')
            ).reset_index()
            warehouse_agg = wh_grouped.to_dict(orient='records')

        # 4. Correlation Analysis
        correlation_matrix = {}
        if not df_suppliers.empty:
            num_cols = ['lead_time_days', 'defect_rate', 'fulfillment_rate', 'reliability_score']
            valid_cols = [c for c in num_cols if c in df_suppliers.columns]
            if len(valid_cols) > 1:
                corr_df = df_suppliers[valid_cols].astype(float).corr().round(3)
                correlation_matrix = {
                    "columns": list(corr_df.columns),
                    "index": list(corr_df.index),
                    "values": corr_df.values.tolist()
                }

        # 5. Outlier Detection (IQR Method on Product Selling Prices)
        outliers = []
        if not df_products.empty and len(df_products) > 3:
            prices = df_products['selling_price'].values
            q25, q75 = np.percentile(prices, 25), np.percentile(prices, 75)
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr

            outlier_df = df_products[(df_products['selling_price'] < lower_bound) | (df_products['selling_price'] > upper_bound)]
            for _, row in outlier_df.iterrows():
                outliers.append({
                    "product_name": row.get('name'),
                    "selling_price": float(row.get('selling_price')),
                    "bound_type": "High Price Outlier" if row.get('selling_price') > upper_bound else "Low Price Outlier",
                    "iqr_bounds": [round(float(lower_bound), 2), round(float(upper_bound), 2)]
                })

        # 6. Crosstab Analysis (Stock Quantity Status across Warehouses)
        crosstab_result = {}
        if not merged_stock.empty and 'name_wh' in merged_stock.columns:
            merged_stock['stock_status'] = pd.cut(
                merged_stock['quantity'], 
                bins=[-1, 15, 50, 10000], 
                labels=['Low Stock', 'Moderate', 'Adequate']
            )
            ct = pd.crosstab(merged_stock['name_wh'], merged_stock['stock_status'])
            crosstab_result = {
                "warehouses": list(ct.index),
                "columns": list(ct.columns),
                "matrix": ct.values.tolist()
            }

        # 7. Statistical Summary
        stat_summary = {}
        if not df_products.empty:
            desc = df_products[['cost_price', 'selling_price', 'margin']].describe().round(2)
            stat_summary = desc.to_dict()

        return {
            "warehouse_aggregations": warehouse_agg,
            "correlation_matrix": correlation_matrix,
            "outliers_detected": outliers,
            "crosstab_analysis": crosstab_result,
            "statistical_summary": stat_summary,
            "summary_kpis": {
                "total_products": len(df_products),
                "total_sales_count": len(df_sales),
                "total_suppliers": len(df_suppliers),
                "total_warehouses": len(df_warehouses)
            }
        }
