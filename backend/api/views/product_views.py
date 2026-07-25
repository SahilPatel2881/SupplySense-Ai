from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.permissions import IsAuthenticatedUser, IsAdminUserRole
from api.models import Product, Stock, Category, Supplier, Warehouse

class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        user = request.user
        category_filter = request.query_params.get('category_id')
        supplier_filter = request.query_params.get('supplier_id')
        search_query = request.query_params.get('search')

        query = {}
        if category_filter:
            query['category_id'] = category_filter
        if supplier_filter:
            query['supplier_id'] = supplier_filter

        products = Product.objects(**query)

        data = []
        for p in products:
            if search_query:
                sq = search_query.lower()
                if sq not in p.name.lower() and sq not in p.sku.lower() and sq not in (p.barcode or '').lower():
                    continue

            d = p.to_dict()
            
            # Fetch Category & Supplier names
            cat = Category.objects(id=p.category_id).first()
            sup = Supplier.objects(id=p.supplier_id).first()
            d['category_name'] = cat.name if cat else "N/A"
            d['supplier_name'] = sup.name if sup else "N/A"

            # Fetch stock quantity for assigned warehouse or total
            if user.role != 'Admin' and user.assigned_warehouse_id:
                st = Stock.objects(product_id=str(p.id), warehouse_id=str(user.assigned_warehouse_id)).first()
                d['total_stock'] = st.quantity if st else 0
            else:
                stocks = Stock.objects(product_id=str(p.id))
                d['total_stock'] = sum(s.quantity for s in stocks)

            d['is_low_stock'] = d['total_stock'] <= p.min_stock_level
            data.append(d)

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can create new products'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name')
        sku = request.data.get('sku')
        category_id = request.data.get('category_id')
        supplier_id = request.data.get('supplier_id')
        cost_price = float(request.data.get('cost_price', 0.0))
        selling_price = float(request.data.get('selling_price', 0.0))

        if not name or not sku or not category_id or not supplier_id:
            return Response({'error': 'Name, SKU, Category, and Supplier are required'}, status=status.HTTP_400_BAD_REQUEST)

        if Product.objects(sku=sku).first():
            return Response({'error': 'Product SKU already exists'}, status=status.HTTP_400_BAD_REQUEST)

        p = Product(
            name=name,
            sku=sku,
            barcode=request.data.get('barcode', ''),
            description=request.data.get('description', ''),
            category_id=category_id,
            supplier_id=supplier_id,
            unit=request.data.get('unit', 'pcs'),
            cost_price=cost_price,
            selling_price=selling_price,
            min_stock_level=int(request.data.get('min_stock_level', 20)),
            reorder_point=int(request.data.get('reorder_point', 35))
        )
        p.save()

        # Initialize stock records (0) for all existing warehouses
        warehouses = Warehouse.objects()
        for wh in warehouses:
            Stock(product_id=str(p.id), warehouse_id=str(wh.id), quantity=0).save()

        return Response(p.to_dict(), status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get_object(self, pk):
        return Product.objects(id=pk).first()

    def get(self, request, pk):
        p = self.get_object(pk)
        if not p:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        d = p.to_dict()
        cat = Category.objects(id=p.category_id).first()
        sup = Supplier.objects(id=p.supplier_id).first()
        d['category_name'] = cat.name if cat else "N/A"
        d['supplier_name'] = sup.name if sup else "N/A"

        # Stock breakdown across warehouses
        stocks = Stock.objects(product_id=str(p.id))
        warehouse_stocks = []
        for s in stocks:
            wh = Warehouse.objects(id=s.warehouse_id).first()
            warehouse_stocks.append({
                "warehouse_id": s.warehouse_id,
                "warehouse_name": wh.name if wh else "Unknown",
                "quantity": s.quantity
            })
        d['warehouse_stocks'] = warehouse_stocks
        d['total_stock'] = sum(s.quantity for s in stocks)
        d['is_low_stock'] = d['total_stock'] <= p.min_stock_level

        return Response(d, status=status.HTTP_200_OK)

    def put(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can modify product details'}, status=status.HTTP_403_FORBIDDEN)

        p = self.get_object(pk)
        if not p:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        for field in ['name', 'barcode', 'description', 'unit', 'category_id', 'supplier_id']:
            if field in request.data:
                setattr(p, field, request.data[field])

        if 'cost_price' in request.data:
            p.cost_price = float(request.data['cost_price'])
        if 'selling_price' in request.data:
            p.selling_price = float(request.data['selling_price'])
        if 'min_stock_level' in request.data:
            p.min_stock_level = int(request.data['min_stock_level'])
        if 'reorder_point' in request.data:
            p.reorder_point = int(request.data['reorder_point'])

        p.save()
        return Response(p.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can delete products'}, status=status.HTTP_403_FORBIDDEN)

        p = self.get_object(pk)
        if not p:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        p.delete()
        Stock.objects(product_id=pk).delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)
