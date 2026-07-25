import os
import sys
import datetime
import random
import mongoengine as me

# Add backend directory to sys path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from api.models import (
    User, Warehouse, Category, Supplier, Product, Stock,
    StockMovement, PurchaseOrder, POItem, Sale, SaleItem, Notification
)

def seed_database():
    print("[*] Connecting to MongoEngine database...")
    me.connect(db='supplysense_db', host='mongodb://127.0.0.1:27017/supplysense_db', serverSelectionTimeoutMS=2000)

    print("[*] Cleaning existing seed data...")
    User.objects.delete()
    Warehouse.objects.delete()
    Category.objects.delete()
    Supplier.objects.delete()
    Product.objects.delete()
    Stock.objects.delete()
    StockMovement.objects.delete()
    PurchaseOrder.objects.delete()
    Sale.objects.delete()
    Notification.objects.delete()

    print("[*] Creating Warehouses...")
    wh1 = Warehouse(name="Central Distribution Center", code="WH-CDC-01", location="Chicago, IL", capacity=25000, contact_number="+1-312-555-0199").save()
    wh2 = Warehouse(name="West Coast Logistics Hub", code="WH-WCL-02", location="Los Angeles, CA", capacity=18000, contact_number="+1-213-555-0144").save()
    wh3 = Warehouse(name="Northern Supply Depot", code="WH-NSD-03", location="Seattle, WA", capacity=12000, contact_number="+1-206-555-0188").save()

    print("[*] Creating 7-Role Hierarchy Users...")

    # 1. Admin
    admin = User(username="admin", email="admin@supplysense.ai", full_name="Executive Admin", role="Admin")
    admin.set_password("admin123")
    admin.save()

    # 2. Warehouse Manager
    mgr1 = User(username="manager1", email="manager1@supplysense.ai", full_name="Sarah Jenkins (Warehouse Mgr)", role="WarehouseManager", assigned_warehouse_id=str(wh1.id))
    mgr1.set_password("manager123")
    mgr1.save()

    # 3. Inventory Manager
    inv_mgr = User(username="inv_manager", email="inv_mgr@supplysense.ai", full_name="David Miller (Inventory Mgr)", role="InventoryManager", assigned_warehouse_id=str(wh1.id))
    inv_mgr.set_password("manager123")
    inv_mgr.save()

    # 4. Stock Manager
    stock_mgr = User(username="stock_manager", email="stock_mgr@supplysense.ai", full_name="Robert Vance (Stock Mgr)", role="StockManager", assigned_warehouse_id=str(wh1.id))
    stock_mgr.set_password("manager123")
    stock_mgr.save()

    # 5. Purchase Manager
    purchase_mgr = User(username="purchase_mgr", email="purchase_mgr@supplysense.ai", full_name="Elena Rostova (Purchase Mgr)", role="PurchaseManager")
    purchase_mgr.set_password("manager123")
    purchase_mgr.save()

    # 6. Sales Manager
    sales_mgr = User(username="sales_mgr", email="sales_mgr@supplysense.ai", full_name="Marcus Reed (Sales Mgr)", role="SalesManager")
    sales_mgr.set_password("manager123")
    sales_mgr.save()

    # 7. Warehouse Employee
    employee1 = User(username="employee1", email="employee1@supplysense.ai", full_name="Alex Rivera (Warehouse Employee)", role="WarehouseEmployee", assigned_warehouse_id=str(wh1.id))
    employee1.set_password("manager123")
    employee1.save()

    wh1.manager_id = str(mgr1.id)
    wh1.save()

    print("[*] Creating Categories...")
    cat1 = Category(name="Electronics & Microcontrollers", code="CAT-ELEC", description="Integrated circuits, SOCs, and microcontrollers").save()
    cat2 = Category(name="Industrial Components", code="CAT-IND", description="Motors, pumps, valves, and heavy fittings").save()
    cat3 = Category(name="Packaging Materials", code="CAT-PKG", description="Corrugated boxes, thermoform trays, and bubble wraps").save()
    cat4 = Category(name="Sensors & Automation", code="CAT-AUTO", description="Proximity sensors, optical encoders, and relays").save()

    print("[*] Creating Suppliers...")
    sup1 = Supplier(name="Apex Semiconductors Inc", code="SUP-APX", contact_person="David Ross", email="sales@apexsemi.com", phone="+1-408-555-9011", lead_time_days=4.5, defect_rate=0.008, fulfillment_rate=0.985, reliability_score=95.2).save()
    sup2 = Supplier(name="Global Tech Components", code="SUP-GTC", contact_person="Elena Rostova", email="info@globaltech.com", phone="+1-650-555-8822", lead_time_days=7.0, defect_rate=0.018, fulfillment_rate=0.940, reliability_score=87.5).save()
    sup3 = Supplier(name="Nexus Packaging Corp", code="SUP-NEX", contact_person="Robert Chen", email="orders@nexuspack.com", phone="+1-312-555-3344", lead_time_days=11.5, defect_rate=0.045, fulfillment_rate=0.860, reliability_score=71.0).save()
    sup4 = Supplier(name="Precision Automation Ltd", code="SUP-PAL", contact_person="Anna Schmidt", email="contact@precisionauto.io", phone="+1-206-555-7799", lead_time_days=3.0, defect_rate=0.003, fulfillment_rate=0.992, reliability_score=98.1).save()

    print("[*] Creating Products & Stocks...")
    products_def = [
        ("ARM Cortex-M4 Microcontroller", "SKU-MCU-001", "890123456701", cat1, sup1, "pcs", 4.50, 12.00, 50, 80),
        ("High-Torque Stepper Motor 24V", "SKU-MTR-002", "890123456702", cat2, sup2, "pcs", 35.00, 75.00, 20, 35),
        ("Optical Proximity Sensor IR", "SKU-SNS-003", "890123456703", cat4, sup4, "pcs", 18.00, 42.00, 15, 30),
        ("Industrial Heavy Corrugated Box XL", "SKU-BOX-004", "890123456704", cat3, sup3, "pcs", 1.20, 3.50, 200, 350),
        ("Solid State Relay 40A DC-AC", "SKU-RLY-005", "890123456705", cat4, sup4, "pcs", 8.50, 22.00, 25, 45),
        ("Hydraulic Pressure Relief Valve", "SKU-VLV-006", "890123456706", cat2, sup2, "pcs", 65.00, 140.00, 10, 18),
        ("ESD Antistatic Bubble Roll 100m", "SKU-BBL-007", "890123456707", cat3, sup3, "roll", 15.00, 38.00, 30, 50),
        ("FPGA Acceleration Board PCI-E", "SKU-FPG-008", "890123456708", cat1, sup1, "pcs", 210.00, 480.00, 8, 15),
    ]

    product_objs = []
    for name, sku, barcode, cat, sup, unit, cost, sell, min_st, reorder in products_def:
        p = Product(
            name=name, sku=sku, barcode=barcode, category_id=str(cat.id), supplier_id=str(sup.id),
            unit=unit, cost_price=cost, selling_price=sell, min_stock_level=min_st, reorder_point=reorder
        ).save()
        product_objs.append(p)

        # Seed initial stock quantities per warehouse
        Stock(product_id=str(p.id), warehouse_id=str(wh1.id), quantity=random.randint(40, 300)).save()
        Stock(product_id=str(p.id), warehouse_id=str(wh2.id), quantity=random.randint(15, 180)).save()
        Stock(product_id=str(p.id), warehouse_id=str(wh3.id), quantity=random.randint(10, 120)).save()

    print("[*] Generating Historical Sales Data for ML & Business Intelligence...")
    now = datetime.datetime.utcnow()
    customers = ["Acme Industrial Corp", "Apex Technologies", "Vortex Dynamics", "LogiTech Solutions", "Walk-in Customer"]

    for day in range(60, 0, -1):
        sale_date = now - datetime.timedelta(days=day)
        num_sales = random.randint(1, 4)
        for _ in range(num_sales):
            wh = random.choice([wh1, wh2, wh3])
            num_items = random.randint(1, 3)
            sampled_prods = random.sample(product_objs, num_items)

            items = []
            total = 0.0
            for prod in sampled_prods:
                qty = random.randint(2, 15)
                unit_p = prod.selling_price
                subtotal = qty * unit_p
                total += subtotal
                items.append(SaleItem(
                    product_id=str(prod.id),
                    product_name=prod.name,
                    quantity=qty,
                    unit_price=unit_p,
                    total=subtotal
                ))

            inv_num = f"INV-HIST-DAY{day}-{_}-{random.randint(10000, 99999)}"
            s = Sale(
                invoice_number=inv_num,
                warehouse_id=str(wh.id),
                customer_name=random.choice(customers),
                items=items,
                total_amount=round(total, 2),
                payment_status='PAID',
                recorded_by_id=str(sales_mgr.id),
                created_at=sale_date
            )
            s.save()

    print("[*] Creating Notifications...")
    Notification(
        warehouse_id=str(wh1.id),
        title="Low Stock Alert: FPGA Acceleration Board",
        message="FPGA Acceleration Board is down to 8 units in Central Distribution Center. Recommended reorder qty: 15 units.",
        type="LOW_STOCK"
    ).save()

    Notification(
        title="Supplier Scorecard Updated",
        message="Apex Semiconductors Inc reliability rating updated to 95.2% based on on-time fulfillment.",
        type="REORDER_RECOMMENDATION"
    ).save()

    print("[+] Database seeding completed successfully!")
    print("--------------------------------------------------")
    print("Seeded 7-Role Credentials:")
    print("  1. Admin:               admin / admin123")
    print("  2. Warehouse Manager:   manager1 / manager123")
    print("  3. Inventory Manager:   inv_manager / manager123")
    print("  4. Stock Manager:       stock_manager / manager123")
    print("  5. Purchase Manager:    purchase_mgr / manager123")
    print("  6. Sales Manager:       sales_mgr / manager123")
    print("  7. Warehouse Employee:  employee1 / manager123")
    print("--------------------------------------------------")

if __name__ == '__main__':
    seed_database()
