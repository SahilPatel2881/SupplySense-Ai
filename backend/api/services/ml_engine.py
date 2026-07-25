import math
import numpy as np
import pandas as pd

from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    confusion_matrix, accuracy_score, precision_score, recall_score
)

class MLEngine:
    @staticmethod
    def forecast_demand(historical_sales_df, model_type='random_forest', forecast_days=30):
        """
        Input: historical_sales_df with columns ['day_index', 'sales_qty']
        Output: dict with predictions array, future dates, and evaluation metrics (MAE, MSE, R2)
        """
        if historical_sales_df is None or len(historical_sales_df) < 5:
            # Generate synthetic fallback baseline dataset for demo/initialization
            days = np.arange(1, 61)
            sales = 50 + 0.8 * days + 15 * np.sin(days / 3.0) + np.random.normal(0, 5, 60)
            historical_sales_df = pd.DataFrame({'day_index': days, 'sales_qty': np.maximum(5, sales)})

        X = historical_sales_df[['day_index']].values
        y = historical_sales_df['sales_qty'].values

        # Split train/test (80/20)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        # Select & train regressor
        if model_type == 'linear':
            model = LinearRegression()
        elif model_type == 'polynomial':
            model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
        elif model_type == 'decision_tree':
            model = DecisionTreeRegressor(max_depth=5, random_state=42)
        else: # random_forest
            model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        # Predict future days
        last_day = int(X[-1][0])
        future_X = np.arange(last_day + 1, last_day + forecast_days + 1).reshape(-1, 1)
        future_preds = model.predict(future_X)
        future_preds = [max(0, round(float(p), 2)) for p in future_preds]

        # Generate comparison metrics across all models
        models_comparison = {}
        all_models = {
            'Linear Regression': LinearRegression(),
            'Polynomial Regression': make_pipeline(PolynomialFeatures(degree=2), LinearRegression()),
            'Decision Tree': DecisionTreeRegressor(max_depth=5, random_state=42),
            'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
        }
        for name, m in all_models.items():
            m.fit(X_train, y_train)
            preds = m.predict(X_test)
            models_comparison[name] = {
                'mae': round(float(mean_absolute_error(y_test, preds)), 3),
                'mse': round(float(mean_squared_error(y_test, preds)), 3),
                'r2': round(float(r2_score(y_test, preds)), 3)
            }

        return {
            "selected_model": model_type,
            "metrics": {
                "mae": round(mae, 3),
                "mse": round(mse, 3),
                "r2": round(r2, 3)
            },
            "historical": {
                "days": [int(d[0]) for d in X],
                "actual": [round(float(v), 2) for v in y]
            },
            "forecast": {
                "days": [int(d[0]) for d in future_X],
                "predicted": future_preds
            },
            "models_comparison": models_comparison
        }

    @staticmethod
    def evaluate_suppliers(supplier_features_df, model_type='random_forest'):
        """
        Input: supplier_features_df with ['lead_time_days', 'defect_rate', 'fulfillment_rate', 'high_risk']
        Output: Classifier evaluation metrics (Accuracy, Precision, Recall, Specificity, Confusion Matrix)
        """
        if supplier_features_df is None or len(supplier_features_df) < 10:
            # Generate synthetic supplier features dataset
            np.random.seed(42)
            n_samples = 100
            lead_time = np.random.uniform(2, 20, n_samples)
            defect_rate = np.random.uniform(0.005, 0.10, n_samples)
            fulfillment_rate = np.random.uniform(0.70, 0.99, n_samples)
            # High risk if lead time > 12 days OR defect rate > 0.05 OR fulfillment < 0.85
            high_risk = ((lead_time > 12) | (defect_rate > 0.05) | (fulfillment_rate < 0.85)).astype(int)
            supplier_features_df = pd.DataFrame({
                'lead_time_days': lead_time,
                'defect_rate': defect_rate,
                'fulfillment_rate': fulfillment_rate,
                'high_risk': high_risk
            })

        X = supplier_features_df[['lead_time_days', 'defect_rate', 'fulfillment_rate']].values
        y = supplier_features_df['high_risk'].values

        # Split train/test
        split_idx = int(len(X) * 0.75)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        if model_type == 'knn':
            model = KNeighborsClassifier(n_neighbors=5)
        elif model_type == 'svm':
            model = SVC(probability=True, random_state=42)
        elif model_type == 'decision_tree':
            model = DecisionTreeClassifier(max_depth=4, random_state=42)
        else: # random_forest
            model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        cm = confusion_matrix(y_test, y_pred)
        # Handle confusion matrix array safely
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            tn, fp, fn, tp = (0, 0, 0, 0)

        accuracy = float(accuracy_score(y_test, y_pred))
        precision = float(precision_score(y_test, y_pred, zero_division=0))
        recall = float(recall_score(y_test, y_pred, zero_division=0))
        specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

        # Model comparison across classifiers
        classifiers_comparison = {}
        all_classifiers = {
            'kNN': KNeighborsClassifier(n_neighbors=5),
            'SVM': SVC(probability=True, random_state=42),
            'Decision Tree': DecisionTreeClassifier(max_depth=4, random_state=42),
            'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        }
        for name, clf in all_classifiers.items():
            clf.fit(X_train, y_train)
            preds = clf.predict(X_test)
            classifiers_comparison[name] = {
                'accuracy': round(float(accuracy_score(y_test, preds)), 3),
                'precision': round(float(precision_score(y_test, preds, zero_division=0)), 3),
                'recall': round(float(recall_score(y_test, preds, zero_division=0)), 3)
            }

        return {
            "selected_model": model_type,
            "metrics": {
                "accuracy": round(accuracy, 3),
                "precision": round(precision, 3),
                "recall": round(recall, 3),
                "specificity": round(specificity, 3)
            },
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp),
                "matrix": cm.tolist()
            },
            "classifiers_comparison": classifiers_comparison
        }

    @staticmethod
    def calculate_reorder_recommendation(daily_demand, lead_time_days, current_stock, ordering_cost=50, holding_cost=2.5):
        """
        Calculates EOQ (Economic Order Quantity), Safety Stock, Reorder Point, and Low Stock Status.
        """
        daily_std = max(1.0, daily_demand * 0.25)
        service_factor_z = 1.65 # 95% service level confidence

        safety_stock = math.ceil(service_factor_z * daily_std * math.sqrt(lead_time_days))
        reorder_point = math.ceil((daily_demand * lead_time_days) + safety_stock)
        
        annual_demand = daily_demand * 365
        eoq = math.ceil(math.sqrt((2 * annual_demand * ordering_cost) / max(0.1, holding_cost)))
        
        is_low_stock = current_stock <= reorder_point
        recommended_reorder_qty = max(0, (reorder_point + eoq) - current_stock) if is_low_stock else 0

        return {
            "current_stock": current_stock,
            "daily_demand": daily_demand,
            "lead_time_days": lead_time_days,
            "safety_stock": safety_stock,
            "reorder_point": reorder_point,
            "economic_order_quantity_eoq": eoq,
            "is_low_stock": is_low_stock,
            "recommended_reorder_qty": recommended_reorder_qty
        }
