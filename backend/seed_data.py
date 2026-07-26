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

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
except ImportError:
    pass

MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'supplysense_db')
MONGO_HOST = os.getenv("MONGO_HOST")
def seed_database():
    print("[*] Connecting to MongoEngine database...")
    me.disconnect()
    try:
        me.connect(db=MONGO_DB_NAME, host=MONGO_HOST, serverSelectionTimeoutMS=3000)
        me.connection.get_connection().admin.command('ping')
        print(f"[*] MongoEngine connected to target database: {MONGO_DB_NAME}")
    except Exception as primary_err:
        print(f"[!] Primary host connection warning ({primary_err}). Falling back to local MongoDB instance...")
        me.disconnect()
        local_host = f"mongodb://127.0.0.1:27017/{MONGO_DB_NAME}"
        me.connect(db=MONGO_DB_NAME, host=local_host, serverSelectionTimeoutMS=2000)
        print(f"[*] MongoEngine connected to local fallback database: {local_host}")

    print("[*] Cleaning existing seed data...")
    User.drop_collection()
    Warehouse.objects.delete()
    Category.objects.delete()
    Supplier.objects.delete()
    Product.objects.delete()
    Stock.objects.delete()
    StockMovement.objects.delete()
    PurchaseOrder.objects.delete()
    Sale.objects.delete()
    Notification.objects.delete()

    print("[*] Creating 5 Strategic Indian & Gujarat Warehouses...")
    wh1 = Warehouse(name="GIDC Mundra Mega Logistics Park", code="WH-MUN-01", location="Mundra Port, Kutch, Gujarat", capacity=45000, contact_number="+91-2838-255011").save()
    wh2 = Warehouse(name="Sanand Industrial Hub Warehouse", code="WH-SAN-02", location="Sanand GIDC, Ahmedabad, Gujarat", capacity=32000, contact_number="+91-79-29750144").save()
    wh3 = Warehouse(name="Hazira Heavy Industrial Depot", code="WH-HAZ-03", location="Hazira Port, Surat, Gujarat", capacity=28000, contact_number="+91-261-2855188").save()
    wh4 = Warehouse(name="Bhiwandi National Supply Hub", code="WH-BHI-04", location="Bhiwandi, Thane, Maharashtra", capacity=50000, contact_number="+91-22-25801990").save()
    wh5 = Warehouse(name="Sriperumbudur Tech Park Depot", code="WH-SRP-05", location="Sriperumbudur, Chennai, Tamil Nadu", capacity=22000, contact_number="+91-44-27150122").save()

    print("[*] Creating 7-Role Hierarchy Users for Gujarat Project Team...")

    # 1. Admin (Sahil Patel - Gujarat HQ)
    admin = User(username="Sahil Patel", email="sahilbhutt2007@gmail.com", full_name="Sahil Patel", role="Admin")
    admin.set_password("Sah@2007")
    admin.save()

    # 2. Warehouse Manager (Krish)
    mgr1 = User(username="Krish", email="Krishjetani55@gmail.com", full_name="Krish", role="WarehouseManager", assigned_warehouse_id=str(wh1.id))
    mgr1.set_password("krish123")
    mgr1.save()

    # 3. Inventory Manager (Dhyan)
    inv_mgr = User(username="Dhyan", email="bhattdhyan056@gmail.com", full_name="Dhyan", role="InventoryManager", assigned_warehouse_id=str(wh1.id))
    inv_mgr.set_password("dhyan123")
    inv_mgr.save()

    # 4. Stock Manager (Shreya)
    stock_mgr = User(username="Shreya", email="sahilbhutt2007@gmail.com", full_name="Shreya", role="StockManager", assigned_warehouse_id=str(wh1.id))
    stock_mgr.set_password("shreya123")
    stock_mgr.save()

    # 5. Purchase Manager (Aarav)
    purchase_mgr = User(username="Aarav", email="Krishjetani55@gmail.com", full_name="Aarav", role="PurchaseManager")
    purchase_mgr.set_password("aarav123")
    purchase_mgr.save()

    # 6. Sales Manager (Priya)
    sales_mgr = User(username="Priya", email="bhattdhyan056@gmail.com", full_name="Priya", role="SalesManager")
    sales_mgr.set_password("priya123")
    sales_mgr.save()

    # 7. Warehouse Employees 1 - 5
    emp1 = User(username="employee1", email="sahilbhutt2007@gmail.com", full_name="Warehouse Employee 1", role="WarehouseEmployee", assigned_warehouse_id=str(wh1.id))
    emp1.set_password("emp123")
    emp1.save()

    emp2 = User(username="employee2", email="sahilbhutt2007@gmail.com", full_name="Warehouse Employee 2", role="WarehouseEmployee", assigned_warehouse_id=str(wh2.id))
    emp2.set_password("emp123")
    emp2.save()

    emp3 = User(username="employee3", email="sahilbhutt2007@gmail.com", full_name="Warehouse Employee 3", role="WarehouseEmployee", assigned_warehouse_id=str(wh3.id))
    emp3.set_password("emp123")
    emp3.save()

    emp4 = User(username="employee4", email="sahilbhutt2007@gmail.com", full_name="Warehouse Employee 4", role="WarehouseEmployee", assigned_warehouse_id=str(wh4.id))
    emp4.set_password("emp123")
    emp4.save()

    emp5 = User(username="employee5", email="sahilbhutt2007@gmail.com", full_name="Warehouse Employee 5", role="WarehouseEmployee", assigned_warehouse_id=str(wh5.id))
    emp5.set_password("emp123")
    emp5.save()

    wh1.manager_id = str(mgr1.id)
    wh1.save()

    print("[*] Creating 8 Indian Product Categories...")
    cat1 = Category(name="Industrial Machinery & Automation", code="CAT-IND", description="Motors, hydraulic valves, CNC tools, VFDs, and heavy machinery").save()
    cat2 = Category(name="Electronics & Semiconductor", code="CAT-ELEC", description="Integrated circuits, ARM boards, sensors, and power modules").save()
    cat3 = Category(name="Textiles & Cotton Garments", code="CAT-TEX", description="Organic cotton bales, polyester yarns, denim fabrics, and silk cones").save()
    cat4 = Category(name="Chemicals & Polymers", code="CAT-CHEM", description="HDPE granules, polypropylene powders, caustic soda, and industrial solvents").save()
    cat5 = Category(name="FMCG & Agri Commodities", code="CAT-AGRI", description="Groundnut oil drums, Basmati rice, spices, and refined sugar").save()
    cat6 = Category(name="Solar & Renewable Energy", code="CAT-SOLAR", description="550W solar panels, grid-tie inverters, and Li-ion battery racks").save()
    cat7 = Category(name="Automotive Engineering", code="CAT-AUTO", description="Brake discs, alloy wheels, transmission gears, and spark plugs").save()
    cat8 = Category(name="Pharmaceuticals & Lifesciences", code="CAT-PHARM", description="Paracetamol API powders, Amoxicillin, saline bags, and blister packaging").save()

    print("[*] Creating 8 Top Indian Industrial Suppliers...")
    sup1 = Supplier(name="Reliance Polymer & Chemical Industries", code="SUP-RELIANCE", contact_person="Rajesh Sharma", email="orders@reliancepoly.co.in", phone="+91-261-6699000", lead_time_days=3.5, defect_rate=0.005, fulfillment_rate=0.991, reliability_score=98.5).save()
    sup2 = Supplier(name="Tata Electronics & Semiconductor Ltd", code="SUP-TATA-ELEC", contact_person="Ananya Desai", email="b2b@tataelectronics.in", phone="+91-79-67778800", lead_time_days=4.0, defect_rate=0.008, fulfillment_rate=0.985, reliability_score=96.2).save()
    sup3 = Supplier(name="Adani Ports & Logistics Infrastructure", code="SUP-ADANI-LOG", contact_person="Viren Mehta", email="logistics@adani.com", phone="+91-2838-255800", lead_time_days=2.5, defect_rate=0.002, fulfillment_rate=0.995, reliability_score=99.1).save()
    sup4 = Supplier(name="Sun Pharma & Lifesciences Corp", code="SUP-SUNPHARMA", contact_person="Dr. Amit Trivedi", email="supplychain@sunpharma.com", phone="+91-265-2307000", lead_time_days=5.0, defect_rate=0.004, fulfillment_rate=0.988, reliability_score=97.8).save()
    sup5 = Supplier(name="Arvind Textile Mills Ltd", code="SUP-ARVIND", contact_person="Harish Lakhani", email="fabrics@arvind.in", phone="+91-79-68223000", lead_time_days=6.0, defect_rate=0.012, fulfillment_rate=0.965, reliability_score=93.4).save()
    sup6 = Supplier(name="Bharat Heavy Electricals Ltd (BHEL)", code="SUP-BHEL", contact_person="Sanjay Verma", email="commercial@bhel.in", phone="+91-265-2271000", lead_time_days=7.0, defect_rate=0.015, fulfillment_rate=0.950, reliability_score=91.0).save()
    sup7 = Supplier(name="Mahindra Engineering & Auto Components", code="SUP-MAHINDRA", contact_person="Pravin Kulkarni", email="autocomp@mahindra.com", phone="+91-20-66120000", lead_time_days=4.5, defect_rate=0.010, fulfillment_rate=0.975, reliability_score=95.0).save()
    sup8 = Supplier(name="Gujarat State Fertilizers & Chemicals (GSFC)", code="SUP-GSFC", contact_person="Ramesh Patel", email="agri-chem@gsfcltd.com", phone="+91-265-2242451", lead_time_days=3.0, defect_rate=0.006, fulfillment_rate=0.982, reliability_score=96.8).save()

    print("[*] Generating 120+ High-Realism Indian Products...")
    
    product_templates = [
        # Industrial Machinery & Automation
        ("Hydraulic Pressure Relief Valve 350 Bar", "SKU-IND-001", cat1, sup6, "pcs", 4500, 8500, 15, 30),
        ("Variable Frequency Drive 15kW 415V", "SKU-IND-002", cat1, sup6, "pcs", 18500, 32000, 8, 15),
        ("High-Torque Industrial Stepper Motor NEMA 34", "SKU-IND-003", cat1, sup6, "pcs", 2800, 5200, 20, 40),
        ("CNC Carbide End Mill Cutting Tool Set", "SKU-IND-004", cat1, sup7, "set", 1400, 2800, 25, 50),
        ("Heavy Precision Ball Bearing 6210 2RS", "SKU-IND-005", cat1, sup7, "pcs", 380, 750, 100, 200),
        ("Pneumatic Cylinder Double Acting 50mm", "SKU-IND-006", cat1, sup6, "pcs", 1200, 2400, 30, 60),
        ("PLC Automation Controller 24V DC", "SKU-IND-007", cat1, sup2, "pcs", 12500, 22000, 10, 20),
        ("Industrial Gearbox Helical 5:1 Ratio", "SKU-IND-008", cat1, sup7, "pcs", 24000, 42000, 5, 12),
        ("Stainless Steel Centrifugal Water Pump 5HP", "SKU-IND-009", cat1, sup6, "pcs", 15500, 28500, 6, 15),
        ("Proximity Inductive Sensor M12 NPN", "SKU-IND-010", cat1, sup2, "pcs", 450, 950, 80, 150),
        ("Industrial Servo Drive Motor 750W", "SKU-IND-011", cat1, sup2, "pcs", 14500, 26000, 10, 20),
        ("Pneumatic Solenoid Valve 5/2 Way 24V", "SKU-IND-012", cat1, sup6, "pcs", 850, 1750, 40, 80),
        ("Linear Motion Guide Rail 20mm 1000mm", "SKU-IND-013", cat1, sup7, "pcs", 3200, 6400, 15, 30),
        ("Heavy Industrial Conveyor Belt 650mm Roll", "SKU-IND-014", cat1, sup3, "roll", 28000, 54000, 4, 8),
        ("Automatic Pressure Switch 1-10 Bar", "SKU-IND-015", cat1, sup6, "pcs", 1100, 2200, 25, 50),

        # Electronics & Semiconductor
        ("FPGA Development Board PCIe Gen4", "SKU-ELEC-016", cat2, sup2, "pcs", 28000, 54000, 10, 20),
        ("ARM Cortex-M4 Industrial Microcontroller IC", "SKU-ELEC-017", cat2, sup2, "pcs", 220, 480, 300, 600),
        ("Power MOSFET Module 600V 50A", "SKU-ELEC-018", cat2, sup2, "pcs", 650, 1350, 120, 250),
        ("Industrial IoT Sensor Gateway LoRaWAN", "SKU-ELEC-019", cat2, sup2, "pcs", 8500, 16500, 12, 25),
        ("Raspberry Pi 4 Compute Module 8GB", "SKU-ELEC-020", cat2, sup2, "pcs", 4800, 8800, 25, 50),
        ("Optocoupler High-Speed Isolator IC", "SKU-ELEC-021", cat2, sup2, "pcs", 35, 85, 1000, 2000),
        ("Multilayer Ceramic Capacitor 10uF 50V (Reel 4000)", "SKU-ELEC-022", cat2, sup2, "reel", 850, 1850, 50, 100),
        ("SMD Voltage Regulator 3.3V LDO Box", "SKU-ELEC-023", cat2, sup2, "box", 450, 980, 80, 160),
        ("Digital Oscilloscope Probe 200MHz", "SKU-ELEC-024", cat2, sup2, "pcs", 1800, 3800, 15, 30),
        ("RS485 Modbus Communication Transceiver IC", "SKU-ELEC-025", cat2, sup2, "pcs", 85, 195, 400, 800),
        ("Microcontroller PIC18F4550 DIP40", "SKU-ELEC-026", cat2, sup2, "pcs", 180, 390, 150, 300),
        ("OLED Display Module 0.96 inch I2C", "SKU-ELEC-027", cat2, sup2, "pcs", 140, 320, 200, 400),
        ("LiPo Battery Charger Controller Board 1A", "SKU-ELEC-028", cat2, sup2, "pcs", 45, 110, 500, 1000),
        ("DC-DC Buck Converter Step-Down Module 5A", "SKU-ELEC-029", cat2, sup2, "pcs", 120, 280, 300, 600),
        ("Precision Current Transformer 100A/5A", "SKU-ELEC-030", cat2, sup2, "pcs", 320, 750, 100, 200),

        # Textiles & Garments (Gujarat Specialty)
        ("Gujarat Organic Raw Cotton Bale 170kg", "SKU-TEX-031", cat3, sup5, "bale", 16500, 24500, 30, 60),
        ("Surat Polyester Filament Yarn Spool 5kg", "SKU-TEX-032", cat3, sup5, "spool", 780, 1450, 150, 300),
        ("Premium Denim Indigo Fabric Roll 100m", "SKU-TEX-033", cat3, sup5, "roll", 12500, 22000, 20, 40),
        ("Mulberry Silk Thread Cones Grade A", "SKU-TEX-034", cat3, sup5, "cone", 1850, 3400, 60, 120),
        ("High-Tenacity Nylon Sewing Thread Box", "SKU-TEX-035", cat3, sup5, "box", 450, 920, 100, 200),
        ("Textile Reactive Dye Powder Blue 25kg Drum", "SKU-TEX-036", cat3, sup1, "drum", 6800, 12500, 15, 30),
        ("100% Combed Cotton Knitting Yarn 30s", "SKU-TEX-037", cat3, sup5, "bag", 3200, 5800, 40, 80),
        ("Jacquard Weaving Shuttle Accessories Set", "SKU-TEX-038", cat3, sup5, "set", 1450, 2900, 25, 50),
        ("Industrial Fabric Calendering Roller Sleeve", "SKU-TEX-039", cat3, sup6, "pcs", 18500, 34000, 4, 8),
        ("Viscose Rayon Staple Fiber 50kg Pack", "SKU-TEX-040", cat3, sup5, "pack", 4500, 8200, 35, 70),

        # Chemicals & Polymers (Surat & Vadodara Hub)
        ("Surat High-Density Polyethylene HDPE Granules 25kg", "SKU-CHEM-041", cat4, sup1, "bag", 2400, 4200, 100, 200),
        ("Polypropylene PP Injection Grade Powder 25kg", "SKU-CHEM-042", cat4, sup1, "bag", 2100, 3800, 120, 240),
        ("Industrial Caustic Soda Flakes 99% 50kg", "SKU-CHEM-043", cat4, sup8, "bag", 1850, 3400, 80, 160),
        ("Industrial Solvent Toluene 210L Drum", "SKU-CHEM-044", cat4, sup1, "drum", 14500, 24000, 15, 30),
        ("Sulfuric Acid Commercial Grade 98% 50L Carboy", "SKU-CHEM-045", cat4, sup8, "carboy", 1600, 2950, 40, 80),
        ("Liquid Epoxy Resin E-05 200kg Drum", "SKU-CHEM-046", cat4, sup1, "drum", 32000, 54000, 10, 20),
        ("PVC Compound Rigid Grade 25kg Bag", "SKU-CHEM-047", cat4, sup1, "bag", 1950, 3500, 90, 180),
        ("Titanium Dioxide Rutile Grade Pigment 25kg", "SKU-CHEM-048", cat4, sup8, "bag", 4800, 8900, 25, 50),
        ("Acetone Technical Grade 200L Steel Drum", "SKU-CHEM-049", cat4, sup1, "drum", 12800, 21500, 12, 24),
        ("Synthetic Rubber Nitrile NBR 25kg Bale", "SKU-CHEM-050", cat4, sup1, "bale", 3900, 7200, 30, 60),

        # FMCG & Agri Commodities (Gujarat Agri Hub)
        ("Saurashtra Groundnut Oil Refined 15L Tin", "SKU-AGRI-051", cat5, sup8, "tin", 1950, 2650, 80, 160),
        ("Gujarat Premium Whole Cumin Seeds (Jeera) 50kg", "SKU-AGRI-052", cat5, sup8, "bag", 11500, 18500, 30, 60),
        ("Basmati Export Quality Aged Rice 25kg Bag", "SKU-AGRI-053", cat5, sup8, "bag", 2400, 3800, 100, 200),
        ("Refined M30 Sugar Grade 50kg Sack", "SKU-AGRI-054", cat5, sup8, "sack", 1900, 2450, 150, 300),
        ("Pure Mustard Seeds Yellow 50kg Bag", "SKU-AGRI-055", cat5, sup8, "bag", 3800, 5900, 40, 80),
        ("Castor Oil Commercial Grade 200L Drum", "SKU-AGRI-056", cat5, sup8, "drum", 18500, 29500, 15, 30),
        ("Dehydrated Onion Powder Export Grade 25kg", "SKU-AGRI-057", cat5, sup8, "box", 2800, 4900, 35, 70),
        ("Processed Cottonseed Cake Cattle Feed 50kg", "SKU-AGRI-058", cat5, sup8, "bag", 1450, 2100, 120, 240),

        # Solar & Renewable Energy
        ("Monocrystalline Solar Panel 550W Half-Cut", "SKU-SOLAR-059", cat6, sup3, "panel", 11500, 19500, 40, 80),
        ("Grid-Tie Solar Inverter 10kW 3-Phase", "SKU-SOLAR-060", cat6, sup6, "pcs", 45000, 78000, 8, 16),
        ("Lithium-Ion Solar Battery Storage Rack 48V 100Ah", "SKU-SOLAR-061", cat6, sup2, "pcs", 68000, 115000, 5, 10),
        ("Solar Aluminium Mounting Structure 4-Panel Set", "SKU-SOLAR-062", cat6, sup3, "set", 3800, 7200, 30, 60),
        ("Solar DC Cable 4mm Twin Core 100m Roll", "SKU-SOLAR-063", cat6, sup3, "roll", 4200, 7800, 25, 50),
        ("Solar MC4 Connector Pair Box (100 Pairs)", "SKU-SOLAR-064", cat6, sup3, "box", 1800, 3500, 20, 40),

        # Automotive Engineering (Sanand Auto Hub)
        ("Ventilated Front Brake Disc Rotor Sanand Series", "SKU-AUTO-065", cat7, sup7, "pcs", 1450, 2850, 50, 100),
        ("Alloy Wheel Rim 16 inch 5-Hole Spec", "SKU-AUTO-066", cat7, sup7, "pcs", 4200, 7800, 30, 60),
        ("Automotive Radiator Assembly Aluminum", "SKU-AUTO-067", cat7, sup7, "pcs", 2800, 5400, 25, 50),
        ("Engine Transmission Gear Shaft 5-Speed", "SKU-AUTO-068", cat7, sup7, "pcs", 3800, 7200, 15, 30),
        ("Iridium Spark Plug Heavy Duty Set (Pack 4)", "SKU-AUTO-069", cat7, sup7, "pack", 850, 1650, 80, 160),
        ("Automotive Shock Absorber Gas Filled", "SKU-AUTO-070", cat7, sup7, "pcs", 1950, 3800, 40, 80),

        # Pharmaceuticals & Lifesciences (Vadodara Hub)
        ("Active Pharma Ingredient Paracetamol Powder 25kg", "SKU-PHARM-071", cat8, sup4, "drum", 6500, 11500, 30, 60),
        ("Amoxicillin Trihydrate Micronized Powder 25kg", "SKU-PHARM-072", cat8, sup4, "drum", 14500, 26000, 20, 40),
        ("Sterile Normal Saline 0.9% 500ml Infusion Box (24)", "SKU-PHARM-073", cat8, sup4, "box", 480, 950, 150, 300),
        ("Pharma PVC/PVDC Blister Packaging Film Roll", "SKU-PHARM-074", cat8, sup4, "roll", 8500, 15500, 15, 30),
        ("Vitamin C Ascorbic Acid Granular API 25kg", "SKU-PHARM-075", cat8, sup4, "drum", 7200, 13800, 25, 50),
        ("Empty Hard Gelatin Capsule Shell Size 0 Box (100k)", "SKU-PHARM-076", cat8, sup4, "box", 9800, 17500, 12, 24),
    ]

    # Generate additional scaled variations to reach 120+ unique items
    all_products_data = list(product_templates)
    base_count = len(product_templates)
    
    categories = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8]
    suppliers = [sup1, sup2, sup3, sup4, sup5, sup6, sup7, sup8]

    for i in range(base_count + 1, 128):
        cat = categories[i % len(categories)]
        sup = suppliers[i % len(suppliers)]
        p_name = f"Industrial Spec Item Grade-{i:03d}"
        p_sku = f"SKU-GUJ-{i:03d}"
        unit = random.choice(["pcs", "kg", "meter", "roll", "box", "drum", "set"])
        cost = random.randint(350, 18500)
        sell = int(cost * random.uniform(1.4, 2.1))
        min_st = random.randint(15, 80)
        reorder = int(min_st * 1.8)
        all_products_data.append((p_name, p_sku, cat, sup, unit, cost, sell, min_st, reorder))

    product_objs = []
    warehouses = [wh1, wh2, wh3, wh4, wh5]

    for idx, item in enumerate(all_products_data):
        name, sku, cat, sup, unit, cost, sell, min_st, reorder = item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8]
        barcode = f"890987654{idx+100:03d}"
        
        p = Product(
            name=name,
            sku=sku,
            barcode=barcode,
            category_id=str(cat.id),
            supplier_id=str(sup.id),
            unit=unit,
            cost_price=float(cost),
            selling_price=float(sell),
            min_stock_level=min_st,
            reorder_point=reorder
        ).save()
        product_objs.append(p)

        # Distribute stocks across all 5 Indian warehouses
        for wh in warehouses:
            # Create low stock for ~15% of items to trigger AI Alerts
            if idx % 7 == 0 and wh == wh1:
                qty = random.randint(2, min_st - 1)
            else:
                qty = random.randint(min_st + 10, min_st * 6)
            
            Stock(product_id=str(p.id), warehouse_id=str(wh.id), quantity=qty).save()

    print(f"[+] Successfully Created {len(product_objs)} Products & Inventory Stocks!")

    print("[*] Generating 35+ Indian Purchase Orders...")
    po_statuses = ['APPROVED', 'RECEIVED', 'PENDING', 'CANCELLED']
    for p_idx in range(1, 36):
        sup = random.choice(suppliers)
        wh = random.choice(warehouses)
        status = random.choice(po_statuses)
        po_date = datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 45))
        
        sampled_prods = random.sample(product_objs, random.randint(2, 5))
        items = []
        total_po = 0.0
        for prod in sampled_prods:
            order_q = random.randint(10, 100)
            u_cost = prod.cost_price
            sub_t = order_q * u_cost
            total_po += sub_t
            items.append(POItem(
                product_id=str(prod.id),
                product_name=prod.name,
                quantity=order_q,
                unit_price=u_cost,
                total=sub_t
            ))
        
        po = PurchaseOrder(
            po_number=f"PO-GUJ-2026-{p_idx:04d}",
            supplier_id=str(sup.id),
            warehouse_id=str(wh.id),
            status=status,
            items=items,
            total_amount=round(total_po, 2),
            created_by_id=str(purchase_mgr.id),
            created_at=po_date
        )
        po.save()

    print("[*] Generating 120+ Historical Sales Records for AI Analytics...")
    now = datetime.datetime.utcnow()
    customers = [
        "Tata Motors Sanand Plant", "Adani Power Ltd Mundra", "Larsen & Toubro Hazira",
        "Nirma Ltd Bhavnagar", "Zydus Lifesciences Ahmedabad", "Torrent Pharmaceuticals Vadodara",
        "Gujarat Alkalies & Chemicals", "Welspun India Kutch", "Alembic Pharma Vadodara",
        "Walk-in Industrial Buyer"
    ]

    for day in range(90, 0, -1):
        sale_date = now - datetime.timedelta(days=day)
        num_sales = random.randint(1, 3)
        for s_i in range(num_sales):
            wh = random.choice(warehouses)
            sampled_prods = random.sample(product_objs, random.randint(1, 4))

            items = []
            total_s = 0.0
            for prod in sampled_prods:
                qty = random.randint(3, 25)
                unit_p = prod.selling_price
                subtotal = qty * unit_p
                total_s += subtotal
                items.append(SaleItem(
                    product_id=str(prod.id),
                    product_name=prod.name,
                    quantity=qty,
                    unit_price=unit_p,
                    total=subtotal
                ))

            inv_num = f"INV-GUJ-{90-day:03d}-{s_i+1}-{random.randint(1000, 9999)}"
            s = Sale(
                invoice_number=inv_num,
                warehouse_id=str(wh.id),
                customer_name=random.choice(customers),
                items=items,
                total_amount=round(total_s, 2),
                payment_status='PAID',
                recorded_by_id=str(sales_mgr.id),
                created_at=sale_date
            )
            s.save()

    print("[*] Creating AI Reorder & Supply Chain Notifications...")
    Notification(
        warehouse_id=str(wh1.id),
        title="AI Reorder Alert: Hydraulic Pressure Relief Valve",
        message="Hydraulic Pressure Relief Valve is down to 4 units in GIDC Mundra. Recommended Reorder: +25 units from BHEL.",
        type="LOW_STOCK"
    ).save()

    Notification(
        warehouse_id=str(wh2.id),
        title="High Demand Horizon Forecasted",
        message="Sanand Auto Hub predicts 42% demand spike in Brake Discs over next 14 days based on Random Forest regressor model.",
        type="REORDER_RECOMMENDATION"
    ).save()

    Notification(
        title="Supplier Reliability Updated",
        message="Reliance Polymer & Chemical Industries reliability rating upgraded to 98.5% based on 0.005 defect rate.",
        type="REORDER_RECOMMENDATION"
    ).save()

    print("[+] Database seeding completed successfully!")
    print("--------------------------------------------------")
    print("Seeded 7-Role Gujarat Supply Chain Credentials:")
    print("  1. Admin:               Sahil Patel (Sah@2007)")
    print("  2. Warehouse Manager:   Krish (krish123)")
    print("  3. Inventory Manager:   Dhyan (dhyan123)")
    print("  4. Stock Manager:       Shreya (shreya123)")
    print("  5. Purchase Manager:    Aarav (aarav123)")
    print("  6. Sales Manager:       Priya (priya123)")
    print("  7. Warehouse Employee:  employee1 .. employee5 (emp123)")
    print("--------------------------------------------------")

if __name__ == '__main__':
    seed_database()
