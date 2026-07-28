from django.urls import path

from api.views.auth_views import LoginView, VerifyOTPView, ResendOTPView, LogoutView, LoginAuditLogView, ProfileView
from api.views.user_views import UserListCreateView, UserDetailView
from api.views.warehouse_views import WarehouseListCreateView, WarehouseDetailView
from api.views.category_views import CategoryListCreateView, CategoryDetailView
from api.views.supplier_views import SupplierListCreateView, SupplierDetailView
from api.views.product_views import ProductListCreateView, ProductDetailView
from api.views.inventory_views import StockInView, StockOutView, StockTransferView, StockMovementListView
from api.views.po_views import PurchaseOrderListCreateView, PurchaseOrderApproveView, PurchaseOrderReceiveView
from api.views.sales_views import SalesListCreateView, InvoicePDFDownloadView
from api.views.report_views import CSVExportView
from api.views.notification_views import NotificationListView
from api.views.dashboard_views import DashboardAnalyticsView, SidebarCountsView

urlpatterns = [
    # Auth
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/login-history/', LoginAuditLogView.as_view(), name='login-history'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),

    # Users (Admin)
    path('users/', UserListCreateView.as_view(), name='users-list-create'),
    path('users/<str:pk>/', UserDetailView.as_view(), name='users-detail'),

    # Warehouses
    path('warehouses/', WarehouseListCreateView.as_view(), name='warehouses-list-create'),
    path('warehouses/<str:pk>/', WarehouseDetailView.as_view(), name='warehouses-detail'),

    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='categories-list-create'),
    path('categories/<str:pk>/', CategoryDetailView.as_view(), name='categories-detail'),

    # Suppliers
    path('suppliers/', SupplierListCreateView.as_view(), name='suppliers-list-create'),
    path('suppliers/<str:pk>/', SupplierDetailView.as_view(), name='suppliers-detail'),

    # Products
    path('products/', ProductListCreateView.as_view(), name='products-list-create'),
    path('products/<str:pk>/', ProductDetailView.as_view(), name='products-detail'),

    # Inventory
    path('inventory/stock-in/', StockInView.as_view(), name='stock-in'),
    path('inventory/stock-out/', StockOutView.as_view(), name='stock-out'),
    path('inventory/transfer/', StockTransferView.as_view(), name='stock-transfer'),
    path('inventory/movements/', StockMovementListView.as_view(), name='stock-movements'),

    # Purchase Orders
    path('purchase-orders/', PurchaseOrderListCreateView.as_view(), name='po-list-create'),
    path('purchase-orders/<str:pk>/approve/', PurchaseOrderApproveView.as_view(), name='po-approve'),
    path('purchase-orders/<str:pk>/receive/', PurchaseOrderReceiveView.as_view(), name='po-receive'),

    # Sales & Invoices
    path('sales/', SalesListCreateView.as_view(), name='sales-list-create'),
    path('sales/<str:pk>/pdf/', InvoicePDFDownloadView.as_view(), name='invoice-pdf'),

    # Reports
    path('reports/<str:report_type>/', CSVExportView.as_view(), name='csv-export'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<str:pk>/read/', NotificationListView.as_view(), name='notification-read'),

    # Dashboard & Business Analytics
    path('dashboard/stats/', DashboardAnalyticsView.as_view(), name='dashboard-stats'),
    path('sidebar/counts/', SidebarCountsView.as_view(), name='sidebar-counts'),
]
