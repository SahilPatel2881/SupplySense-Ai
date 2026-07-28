import os
import random
import datetime
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import (
    User, Warehouse, Category, Supplier, Product, Stock,
    PurchaseOrder, POItem, Sale, SaleItem
)

def run_seed():
    print("[*] Starting Ultra-Fast MongoDB Bulk Data Seeding...")

    # 1. Ensure Default Admin User exists
    admin_user = User.objects(username="Sahil Patel").first()
    if not admin_user:
        admin_user = User(
            username="Sahil Patel",
            email="sahil@supplysense.com",
            full_name="Sahil Patel",
            role="Admin"
        )
        admin_user.set_password("Sah@2007")
        admin_user.save()

    # 2. Warehouses (6 Facilities)
    warehouses_data = [
        {"name": "Central Mumbai Fulfillment Hub", "code": "WH-MUM-01", "location": "Bhiwandi, Mumbai, MH", "capacity": 50000, "contact": "+91 98200 11223"},
        {"name": "Bengaluru Tech Park Depot", "code": "WH-BLR-02", "location": "Peenya Industrial Area, Bengaluru, KA", "capacity": 40000, "contact": "+91 98450 33445"},
        {"name": "Delhi NCR Logistics Center", "code": "WH-DEL-03", "location": "Gurgaon Logistics Zone, Delhi NCR", "capacity": 60000, "contact": "+91 98110 55667"},
        {"name": "Ahmedabad Industrial Gateway", "code": "WH-AMD-04", "location": "Sanand GIDC, Ahmedabad, GJ", "capacity": 35000, "contact": "+91 98790 77889"},
        {"name": "Chennai Port Distribution Hub", "code": "WH-MAA-05", "location": "Ennore Port SEZ, Chennai, TN", "capacity": 45000, "contact": "+91 98400 99001"},
        {"name": "Kolkata Eastern Regional Depot", "code": "WH-CCU-06", "location": "Dankuni Industrial Park, Kolkata, WB", "capacity": 30000, "contact": "+91 98300 22334"}
    ]

    warehouses = []
    for w in warehouses_data:
        wh = Warehouse.objects(code=w["code"]).first()
        if not wh:
            wh = Warehouse(
                name=w["name"], code=w["code"], location=w["location"],
                capacity=w["capacity"], contact_number=w["contact"],
                status="Active", manager_id=str(admin_user.id)
            )
            wh.save()
        warehouses.append(wh)

    # 3. Categories (10 Categories)
    categories_data = [
        {"name": "Industrial Tools & Machinery", "code": "CAT-IND-TOOLS", "desc": "Power tools, CNC cutters, lathes, and precision measuring devices"},
        {"name": "Electronics & Semiconductors", "code": "CAT-ELEC-SEMI", "desc": "Microcontrollers, ICs, relays, PCB boards, and sensors"},
        {"name": "Raw Materials & Steel Alloys", "code": "CAT-RAW-STEEL", "desc": "Stainless steel sheets, aluminum bars, copper tubes, and wire coils"},
        {"name": "Packaging & Shipping Supplies", "code": "CAT-PKG-SUP", "desc": "Corrugated boxes, bubble wrap, stretch film, and shipping pallets"},
        {"name": "Safety & PPE Equipment", "code": "CAT-SAFETY-PPE", "desc": "Helmets, safety goggles, high-visibility vests, and steel-toe boots"},
        {"name": "Office Tech & Consumables", "code": "CAT-OFFICE-TECH", "desc": "Thermal printers, barcode scanners, paper rolls, and labels"},
        {"name": "Chemical Reagents & Solvents", "code": "CAT-CHEM-SOLV", "desc": "Industrial solvents, lubricants, adhesives, and degreasers"},
        {"name": "Fasteners, Nuts & Bolts", "code": "CAT-FASTENERS", "desc": "High-tensile hex bolts, washers, anchor studs, and rivets"},
        {"name": "Hydraulic & Pneumatic Valves", "code": "CAT-HYD-PNEU", "desc": "Hydraulic cylinders, pressure gauges, air hoses, and solenoid valves"},
        {"name": "Electrical Cables & Wiring", "code": "CAT-ELEC-CABLES", "desc": "Heavy-duty armored cables, wire ducts, junction boxes, and terminal blocks"}
    ]

    categories = []
    for c in categories_data:
        cat = Category.objects(code=c["code"]).first()
        if not cat:
            cat = Category(name=c["name"], code=c["code"], description=c["desc"])
            cat.save()
        categories.append(cat)

    # 4. Suppliers (12 Suppliers)
    suppliers_data = [
        {"name": "Apex Global Industrial Supplies", "code": "SUP-APEX-01", "contact": "Rajesh Sharma", "email": "contact@apexglobal.in", "phone": "+91 98210 12345", "lead_time": 5.0, "defect": 0.015, "fulfillment": 0.97, "score": 94.0},
        {"name": "Titan Heavy Components Pvt Ltd", "code": "SUP-TITAN-02", "contact": "Anish Varma", "email": "sales@titancomp.com", "phone": "+91 98111 23456", "lead_time": 7.0, "defect": 0.020, "fulfillment": 0.94, "score": 90.0},
        {"name": "Bharat Raw Materials Corporation", "code": "SUP-BHARAT-03", "contact": "Suresh Patel", "email": "orders@bharatraw.co.in", "phone": "+91 98790 34567", "lead_time": 10.0, "defect": 0.035, "fulfillment": 0.89, "score": 82.0},
        {"name": "Horizon Electronics & Chips Co", "code": "SUP-HORIZON-04", "contact": "Meera Nair", "email": "supply@horizonelec.io", "phone": "+91 98450 45678", "lead_time": 4.0, "defect": 0.010, "fulfillment": 0.98, "score": 96.0},
        {"name": "Supreme Packaging Solutions", "code": "SUP-SUPREME-05", "contact": "Vikram Singh", "email": "info@supremepkg.in", "phone": "+91 98300 56789", "lead_time": 3.0, "defect": 0.012, "fulfillment": 0.96, "score": 93.0},
        {"name": "Metro Fasteners & Hardware Ltd", "code": "SUP-METRO-06", "contact": "Karan Gupta", "email": "sales@metrofasteners.com", "phone": "+91 98200 67890", "lead_time": 6.0, "defect": 0.025, "fulfillment": 0.92, "score": 87.0},
        {"name": "Premier Chemical & Solvents Corp", "code": "SUP-PREMIER-07", "contact": "Deepak Mehta", "email": "order@premierchem.in", "phone": "+91 98980 78901", "lead_time": 8.0, "defect": 0.030, "fulfillment": 0.91, "score": 85.0},
        {"name": "Precision Tools & Gauges India", "code": "SUP-PRECISION-08", "contact": "Pooja Reddy", "email": "support@precisiontools.in", "phone": "+91 98400 89012", "lead_time": 5.0, "defect": 0.018, "fulfillment": 0.95, "score": 91.0},
        {"name": "Apex Polymer & Adhesives Ltd", "code": "SUP-POLYMER-09", "contact": "Amit Joshi", "email": "info@apexpolymer.co.in", "phone": "+91 98220 90123", "lead_time": 9.0, "defect": 0.040, "fulfillment": 0.86, "score": 79.0},
        {"name": "National Hardware & Wire Works", "code": "SUP-NATIONAL-10", "contact": "Sunil Rao", "email": "sales@nationalhardware.in", "phone": "+91 98440 01234", "lead_time": 7.0, "defect": 0.022, "fulfillment": 0.93, "score": 88.0},
        {"name": "Dynamic Pneumatics & Valves Co", "code": "SUP-DYNAMIC-11", "contact": "Gaurav Malhotra", "email": "contact@dynamicvalves.com", "phone": "+91 98100 12389", "lead_time": 6.0, "defect": 0.019, "fulfillment": 0.95, "score": 91.0},
        {"name": "Vanguard Electricals & Cables", "code": "SUP-VANGUARD-12", "contact": "Arun Kumar", "email": "dispatch@vanguardelec.com", "phone": "+91 98310 23490", "lead_time": 4.5, "defect": 0.014, "fulfillment": 0.97, "score": 95.0}
    ]

    suppliers = []
    for s in suppliers_data:
        sup = Supplier.objects(code=s["code"]).first()
        if not sup:
            sup = Supplier(
                name=s["name"], code=s["code"], contact_person=s["contact"],
                email=s["email"], phone=s["phone"], address="Industrial Estate, Phase II, India",
                lead_time_days=s["lead_time"], defect_rate=s["defect"],
                fulfillment_rate=s["fulfillment"], reliability_score=s["score"],
                status="Active"
            )
            sup.save()
        suppliers.append(sup)

    # 5. Seed 250 Products using Bulk Insert
    product_templates = [
        ("Heavy Duty Angle Grinder 850W", "CAT-IND-TOOLS", "pcs", 2100, 3200, 15, 30),
        ("Digital Vernier Caliper 150mm", "CAT-IND-TOOLS", "pcs", 1400, 2200, 20, 35),
        ("Rotary Hammer Drill Machine 26mm", "CAT-IND-TOOLS", "pcs", 4500, 6800, 10, 20),
        ("Impact Torque Wrench 1/2 Inch", "CAT-IND-TOOLS", "pcs", 3800, 5600, 12, 25),
        ("Industrial Carbide End Mill 10mm", "CAT-IND-TOOLS", "pcs", 850, 1450, 50, 80),
        ("Precision Dial Indicator 0.01mm", "CAT-IND-TOOLS", "pcs", 1250, 1950, 25, 40),
        ("Laser Distance Meter 60m Range", "CAT-IND-TOOLS", "pcs", 2800, 4200, 15, 30),
        ("Pneumatic Die Grinder Kit", "CAT-IND-TOOLS", "pcs", 1950, 2900, 18, 32),
        ("Hydraulic Crimping Tool 16-300mm2", "CAT-IND-TOOLS", "pcs", 5200, 7900, 8, 15),
        ("Bench Vice Swivel Base 6 Inch", "CAT-IND-TOOLS", "pcs", 3100, 4600, 14, 25),
        ("STM32 ARM Cortex-M4 Board", "CAT-ELEC-SEMI", "pcs", 650, 1100, 40, 75),
        ("ESP32 Wi-Fi + BLE Microcontroller", "CAT-ELEC-SEMI", "pcs", 320, 580, 100, 180),
        ("Optocoupler IC PC817 (Pack 100)", "CAT-ELEC-SEMI", "boxes", 450, 850, 30, 60),
        ("Solid State Relay 40A 240VAC", "CAT-ELEC-SEMI", "pcs", 780, 1350, 25, 45),
        ("Ultrasonic Distance Sensor HC-SR04", "CAT-ELEC-SEMI", "pcs", 120, 240, 80, 150),
        ("OLED Display Module 0.96 Inch I2C", "CAT-ELEC-SEMI", "pcs", 210, 390, 60, 110),
        ("Switching Power Supply 24V 10A", "CAT-ELEC-SEMI", "pcs", 1650, 2600, 20, 40),
        ("Multilayer Ceramic Capacitor Kit", "CAT-ELEC-SEMI", "boxes", 890, 1500, 25, 45),
        ("Step-Down Voltage Regulator LM2596", "CAT-ELEC-SEMI", "pcs", 95, 180, 120, 200),
        ("Industrial Temperature Transducer PT100", "CAT-ELEC-SEMI", "pcs", 1450, 2350, 15, 30),
        ("Stainless Steel Sheet 304 Grade 2mm", "CAT-RAW-STEEL", "sq.m", 1850, 2800, 30, 60),
        ("Aluminum Extrusion Profile 40x40", "CAT-RAW-STEEL", "meters", 380, 620, 100, 200),
        ("Seamless Copper Tube 1/2 Inch", "CAT-RAW-STEEL", "meters", 420, 680, 80, 150),
        ("Cold Rolled Steel Coil 1.5mm", "CAT-RAW-STEEL", "kg", 85, 135, 500, 1000),
        ("Brass Hexagonal Rod 25mm", "CAT-RAW-STEEL", "meters", 890, 1400, 40, 75),
        ("Galvanized Iron Sheet 1mm", "CAT-RAW-STEEL", "sq.m", 620, 980, 50, 100),
        ("Carbon Fiber Sheet 3mm 500x500", "CAT-RAW-STEEL", "pcs", 3400, 5200, 10, 20),
        ("Titanium Grade 5 Bar 20mm", "CAT-RAW-STEEL", "meters", 4200, 6500, 8, 15),
        ("Cast Iron Round Bar 50mm", "CAT-RAW-STEEL", "kg", 110, 175, 300, 600),
        ("Structural Steel Angle Iron 50x50x5", "CAT-RAW-STEEL", "meters", 240, 390, 150, 300),
        ("Heavy Duty Corrugated Box 5-Ply 18x12x12", "CAT-PKG-SUP", "pcs", 35, 65, 300, 600),
        ("Anti-Static Bubble Wrap Roll 100m", "CAT-PKG-SUP", "rolls", 850, 1400, 20, 40),
        ("Industrial Stretch Film Roll 500mm", "CAT-PKG-SUP", "rolls", 480, 780, 40, 80),
        ("Heavy Duty Plastic Pallet 1200x1000", "CAT-PKG-SUP", "pcs", 2100, 3300, 25, 50),
        ("Polypropylene Strapping Tape Roll", "CAT-PKG-SUP", "rolls", 620, 980, 30, 60),
        ("Industrial Hard Hat Helmet ANSI", "CAT-SAFETY-PPE", "pcs", 280, 480, 50, 100),
        ("Anti-Scratch Safety Spectacles Clear", "CAT-SAFETY-PPE", "pcs", 95, 180, 150, 300),
        ("High-Visibility LED Reflective Vest", "CAT-SAFETY-PPE", "pcs", 220, 380, 80, 150),
        ("Steel Toe Cap Safety Shoes S3", "CAT-SAFETY-PPE", "pairs", 1650, 2600, 30, 60),
        ("Nitrile Chemical Resistant Gloves (Pack 100)", "CAT-SAFETY-PPE", "boxes", 550, 920, 40, 80),
        ("Industrial Thermal Transfer Label Printer", "CAT-OFFICE-TECH", "pcs", 18500, 26500, 5, 10),
        ("Wireless 2D Handheld Barcode Scanner", "CAT-OFFICE-TECH", "pcs", 3400, 5200, 15, 30),
        ("Industrial Cleaning Degreaser Solvent 20L", "CAT-CHEM-SOLV", "cans", 2200, 3400, 20, 40),
        ("Multi-Purpose Penetrating Lubricant Spray", "CAT-CHEM-SOLV", "cans", 180, 320, 100, 200),
        ("Stainless Steel Hex Head Bolt M10x50 (Pack 100)", "CAT-FASTENERS", "boxes", 680, 1150, 40, 80),
        ("High Tensile Grade 8.8 Hex Nut M12 (Pack 200)", "CAT-FASTENERS", "boxes", 520, 890, 50, 100),
        ("Double Acting Hydraulic Cylinder 50x300mm", "CAT-HYD-PNEU", "pcs", 8500, 12800, 6, 12),
        ("Pneumatic Solenoid Valve 5/2 Way 24VDC", "CAT-HYD-PNEU", "pcs", 1450, 2300, 25, 50),
        ("Armored Copper Control Cable 4 Core 2.5mm2", "CAT-ELEC-CABLES", "meters", 145, 240, 200, 400),
        ("Flexible PVC Conduit Pipe 25mm 50m Roll", "CAT-ELEC-CABLES", "rolls", 920, 1500, 25, 50)
    ]

    new_prod_objs = []
    prod_counter = Product.objects.count() + 1
    existing_skus = set(p.sku for p in Product.objects.only('sku'))

    for base_name, cat_code, unit, cost, sell, min_lvl, reorder in product_templates:
        cat_obj = next((c for c in categories if c.code == cat_code), categories[0])
        variants = ["Base Model", "Standard Grade", "Heavy-Duty", "Premium Series", "Compact Variant"]

        for var in variants:
            sku = f"SKU-PROD-{prod_counter:04d}"
            if sku not in existing_skus:
                p_name = f"{base_name} ({var})" if var != "Base Model" else base_name
                barcode = f"89012345{prod_counter:04d}"
                sup_obj = random.choice(suppliers)
                adj = 1.0 + (random.randint(-10, 15) / 100.0)
                cost_p = round(cost * adj, 2)
                sell_p = round(sell * adj, 2)

                new_prod_objs.append(Product(
                    name=p_name, sku=sku, barcode=barcode,
                    description=f"{p_name} engineered for high reliability in industrial and logistics operations.",
                    category_id=str(cat_obj.id), supplier_id=str(sup_obj.id),
                    unit=unit, cost_price=cost_p, selling_price=sell_p,
                    min_stock_level=min_lvl, reorder_point=reorder
                ))
            prod_counter += 1
            if prod_counter > 250:
                break
        if prod_counter > 250:
            break

    if new_prod_objs:
        Product.objects.insert(new_prod_objs)
        print(f"Bulk inserted {len(new_prod_objs)} new Products")

    all_products = list(Product.objects.all())
    print(f"Total Products in DB: {len(all_products)}")

    # 6. Bulk Insert Stock Quantities
    existing_stock_keys = set(f"{s.product_id}_{s.warehouse_id}" for s in Stock.objects.only('product_id', 'warehouse_id'))
    new_stocks = []

    for p in all_products:
        for wh in warehouses:
            key = f"{str(p.id)}_{str(wh.id)}"
            if key not in existing_stock_keys:
                is_low = random.random() < 0.15
                qty = random.randint(1, p.min_stock_level - 1) if is_low else random.randint(p.reorder_point + 10, p.reorder_point + 250)
                new_stocks.append(Stock(
                    product_id=str(p.id),
                    warehouse_id=str(wh.id),
                    quantity=qty,
                    batch_number=f"BATCH-2026-W{wh.code[-2:]}-{random.randint(100, 999)}",
                    expiry_date=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=random.randint(180, 720))
                ))

    if new_stocks:
        Stock.objects.insert(new_stocks, load_bulk=False)
        print(f"Bulk inserted {len(new_stocks)} Stock records")

    # 7. Bulk Insert Purchase Orders (50 POs)
    if PurchaseOrder.objects.count() < 50:
        statuses = ['APPROVED', 'RECEIVED', 'PENDING', 'DRAFT']
        new_pos = []
        for i in range(1, 51):
            po_num = f"PO-2026-{i:03d}"
            if not PurchaseOrder.objects(po_number=po_num).first():
                sup = random.choice(suppliers)
                wh = random.choice(warehouses)
                sample_prods = random.sample(all_products, random.randint(2, 5))
                po_items = []
                tot_amt = 0.0
                for item_p in sample_prods:
                    q = random.randint(20, 150)
                    price = item_p.cost_price
                    line_tot = round(q * price, 2)
                    tot_amt += line_tot
                    po_items.append(POItem(
                        product_id=str(item_p.id),
                        product_name=item_p.name,
                        quantity=q,
                        unit_price=price,
                        total=line_tot
                    ))
                st = random.choice(statuses)
                created_dt = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(1, 60))
                new_pos.append(PurchaseOrder(
                    po_number=po_num, supplier_id=str(sup.id), warehouse_id=str(wh.id),
                    items=po_items, total_amount=round(tot_amt, 2), status=st,
                    created_by_id=str(admin_user.id),
                    approved_by_id=str(admin_user.id) if st in ['APPROVED', 'RECEIVED'] else None,
                    created_at=created_dt, updated_at=created_dt
                ))
        if new_pos:
            PurchaseOrder.objects.insert(new_pos, load_bulk=False)
            print(f"Bulk inserted {len(new_pos)} Purchase Orders")

    # 8. Bulk Insert Sales Invoices (100 Sales)
    if Sale.objects.count() < 100:
        customers = [
            "Tata Motors Supply Operations", "Reliance Industries Logistics",
            "Larsen & Toubro Construction", "Mahindra & Mahindra Assembly",
            "Godrej & Boyce Manufacturing", "Siemens India Electricals",
            "Bosch Automotive Components", "ABB Power & Automation",
            "Schneider Electric India", "Thermax Boiler Systems"
        ]
        new_sales = []
        for i in range(1, 101):
            inv_num = f"INV-2026-{i:03d}"
            if not Sale.objects(invoice_number=inv_num).first():
                wh = random.choice(warehouses)
                cust = random.choice(customers)
                sample_prods = random.sample(all_products, random.randint(2, 6))
                sale_items = []
                tot_amt = 0.0
                for item_p in sample_prods:
                    q = random.randint(5, 50)
                    price = item_p.selling_price
                    line_tot = round(q * price, 2)
                    tot_amt += line_tot
                    sale_items.append(SaleItem(
                        product_id=str(item_p.id),
                        product_name=item_p.name,
                        quantity=q,
                        unit_price=price,
                        total=line_tot
                    ))
                created_dt = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(1, 90))
                new_sales.append(Sale(
                    invoice_number=inv_num, warehouse_id=str(wh.id), customer_name=cust,
                    items=sale_items, total_amount=round(tot_amt, 2),
                    payment_status="PAID" if i % 10 != 0 else "PENDING",
                    recorded_by_id=str(admin_user.id), created_at=created_dt
                ))
        if new_sales:
            Sale.objects.insert(new_sales, load_bulk=False)
            print(f"Bulk inserted {len(new_sales)} Sales Invoices")

    print("\n[SUCCESS] MongoDB Data Seed Complete:")
    print(f"   Total Products: {Product.objects.count()}")
    print(f"   Total Warehouses: {Warehouse.objects.count()}")
    print(f"   Total Suppliers: {Supplier.objects.count()}")
    print(f"   Total Categories: {Category.objects.count()}")
    print(f"   Total Stock Entries: {Stock.objects.count()}")
    print(f"   Total Purchase Orders: {PurchaseOrder.objects.count()}")
    print(f"   Total Sales Invoices: {Sale.objects.count()}")

if __name__ == "__main__":
    run_seed()
