from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser
from api.services.ai_engine import AIEngineService
from api.services.scraper import MarketWebScraperService
from api.models import MarketPrice

def get_warehouse_scope(user):
    role = getattr(user, 'role', None)
    if role not in ['Founder', 'Admin'] and getattr(user, 'assigned_warehouse_id', None):
        return str(user.assigned_warehouse_id)
    return None

def check_ai_permission(request, allowed_roles):
    role = getattr(request.user, 'role', None)
    if role in ['Founder', 'Admin', 'WarehouseManager', 'InventoryManager', 'StockManager', 'PurchaseManager', 'SalesManager']:
        return True
    return role in allowed_roles


class DemandPredictionView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['SalesManager']):
            return Response({'error': 'Demand Prediction is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.predict_demand(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class StockRiskView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['WarehouseManager', 'InventoryManager', 'StockManager']):
            return Response({'error': 'Stock Risk Analytics is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.predict_stockout_risk(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class SupplierRankingView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['PurchaseManager']):
            return Response({'error': 'Supplier Ranking AI is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.rank_suppliers(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class ProductVelocityView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['SalesManager', 'InventoryManager']):
            return Response({'error': 'Product Velocity AI is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.classify_product_velocity(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class NetworkGraphView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['WarehouseManager']):
            return Response({'error': 'Network Graph Analytics is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.generate_network_graph(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class AnomalyDetectionView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['WarehouseManager', 'InventoryManager']):
            return Response({'error': 'Anomaly Detection AI is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.detect_outliers(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class DataCleaningView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['WarehouseManager', 'InventoryManager']):
            return Response({'error': 'Data Cleaning Engine is restricted'}, status=status.HTTP_403_FORBIDDEN)
        wh_id = get_warehouse_scope(request.user)
        data = AIEngineService.execute_pandas_cleaning_pipeline(warehouse_id=wh_id)
        return Response(data, status=status.HTTP_200_OK)


class MarketScraperView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        if not check_ai_permission(request, ['PurchaseManager', 'InventoryManager']):
            return Response({'error': 'Market Scraper is restricted'}, status=status.HTTP_403_FORBIDDEN)
        prices = list(MarketPrice.objects.order_by('-scraped_at')[:10])
        if not prices:
            res = MarketWebScraperService.scrape_and_update_prices()
            return Response(res, status=status.HTTP_200_OK)
        return Response([p.to_dict() for p in prices], status=status.HTTP_200_OK)

    def post(self, request):
        if not check_ai_permission(request, ['PurchaseManager', 'InventoryManager']):
            return Response({'error': 'Market Scraper is restricted'}, status=status.HTTP_403_FORBIDDEN)
        res = MarketWebScraperService.scrape_and_update_prices()
        return Response(res, status=status.HTTP_200_OK)
