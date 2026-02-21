"""
management/commands/seed_data.py

Usage:
    python manage.py seed_data

Drops and re-creates seed data for all models.
Images are picked at random from:
    D:\\BACKUP\\Complete Projects\\Ecommerced_Website\\backend\\New folder
"""

import os
import random
import uuid
import glob
import shutil
from decimal import Decimal
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.conf import settings

# ── adjust this import path to match your app name ──────────────────────────
from store.models import (          # <-- change "store" to your app label
    Address, Store, Category, Product, ProductImage,
    ProductAttribute, ProductVariant, Review, Cart, CartItem,
    Wishlist, Order, OrderItem, MpesaTransaction, Coupon, Banner, FlashSale,
)

User = get_user_model()

# ── local image source directory (Windows path – also works on WSL) ──────────
IMAGE_SOURCE_DIR = r"D:\BACKUP\Complete Projects\Ecommerced_Website\backend\New folder"

# ── media sub-directories that Django expects ────────────────────────────────
MEDIA_SUBDIRS = {
    "avatars":          "avatars",
    "stores_logos":     "stores/logos",
    "stores_banners":   "stores/banners",
    "categories":       "categories",
    "products":         "products",
    "banners":          "banners",
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _collect_images():
    """Return a list of all image file paths from the source directory."""
    extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.gif")
    images = []
    for ext in extensions:
        images += glob.glob(os.path.join(IMAGE_SOURCE_DIR, "**", ext), recursive=True)
        images += glob.glob(os.path.join(IMAGE_SOURCE_DIR, ext))
    if not images:
        raise FileNotFoundError(
            f"No images found in {IMAGE_SOURCE_DIR!r}. "
            "Check the path and make sure images exist there."
        )
    return images


def _random_image(images):
    return random.choice(images)


def _open_image_field(image_path, media_subdir):
    """
    Copy the image into MEDIA_ROOT/<media_subdir>/ and return a Django File
    object pointing at the copy so it can be assigned to an ImageField.
    """
    dest_dir = os.path.join(settings.MEDIA_ROOT, media_subdir)
    os.makedirs(dest_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex[:8]}_{os.path.basename(image_path)}"
    dest_path = os.path.join(dest_dir, filename)
    shutil.copy2(image_path, dest_path)
    rel_path = os.path.join(media_subdir, filename)
    return rel_path          # store relative path directly in ImageField


def _slug(text, extra=""):
    base = slugify(text + (" " + extra if extra else ""))
    return base or f"item-{uuid.uuid4().hex[:6]}"


def _unique_slug(text, model_cls, field="slug"):
    base = _slug(text)
    slug = base
    i = 1
    while model_cls.objects.filter(**{field: slug}).exists():
        slug = f"{base}-{i}"
        i += 1
    return slug


def _rand_price(low=200, high=50000):
    return Decimal(str(round(random.uniform(low, high), 2)))


def _rand_discount(price):
    if random.random() > 0.5:
        pct = random.randint(5, 40) / 100
        return Decimal(str(round(float(price) * (1 - pct), 2)))
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Data pools
# ─────────────────────────────────────────────────────────────────────────────

KENYAN_COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
    "Thika", "Nyeri", "Meru", "Kitale", "Garissa",
]
KENYAN_TOWNS = [
    "Westlands", "Kilimani", "Karen", "Eastleigh", "Parklands",
    "Ngong", "Kikuyu", "Ruiru", "Athi River", "Limuru",
]

CATEGORY_DATA = [
    {"name": "Electronics",     "icon": "cpu",          "children": ["Phones & Tablets", "Laptops", "TVs & Audio", "Cameras"]},
    {"name": "Fashion",         "icon": "shirt",        "children": ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories"]},
    {"name": "Home & Living",   "icon": "home",         "children": ["Furniture", "Kitchenware", "Bedding", "Decor"]},
    {"name": "Beauty",          "icon": "sparkles",     "children": ["Skincare", "Hair Care", "Fragrances", "Makeup"]},
    {"name": "Sports",          "icon": "activity",     "children": ["Fitness Equipment", "Outdoor Gear", "Sportswear"]},
    {"name": "Groceries",       "icon": "shopping-bag", "children": ["Fresh Produce", "Beverages", "Snacks", "Dairy"]},
    {"name": "Books & Media",   "icon": "book-open",    "children": ["Books", "Music", "Movies"]},
]

VENDOR_DATA = [
    ("vendor1", "Alice Wanjiku",    "Wanjiku Tech Hub",   "Leading electronics & gadgets store in Nairobi."),
    ("vendor2", "Brian Otieno",     "Otieno Fashions",    "Trendy affordable fashion for the modern Kenyan."),
    ("vendor3", "Carol Mwangi",     "Casa Mwangi",        "Quality home goods sourced from across Africa."),
    ("vendor4", "David Kipchoge",   "Kipchoge Sports",    "Sports equipment and fitness gear."),
    ("vendor5", "Eve Kamau",        "Kamau Beaute",       "Premium beauty & personal care products."),
    ("vendor6", "Frank Njoroge",    "Njoroge Grocers",    "Fresh farm produce delivered to your door."),
    ("vendor7", "Grace Achieng",    "Achieng Books",      "Books, music, and media for every taste."),
]

PRODUCT_POOL = [
    # (name, category_leaf, base_price)
    ("Samsung Galaxy A55",              "Phones & Tablets",   35000),
    ("Tecno Spark 20 Pro",              "Phones & Tablets",   18000),
    ("iPhone 15 Standard",              "Phones & Tablets",   95000),
    ("Infinix Hot 40i",                 "Phones & Tablets",   12500),
    ("iPad 10th Generation",            "Phones & Tablets",   55000),
    ("HP Pavilion 15 Laptop",           "Laptops",            65000),
    ("Lenovo IdeaPad Slim 5",           "Laptops",            72000),
    ("Dell Inspiron 15",                "Laptops",            68000),
    ("MacBook Air M2",                  "Laptops",           175000),
    ("Acer Aspire 5",                   "Laptops",            58000),
    ("LG 43-inch Smart TV",             "TVs & Audio",        38000),
    ("Samsung 55-inch QLED TV",         "TVs & Audio",        85000),
    ("JBL Clip 4 Speaker",              "TVs & Audio",         6500),
    ("Sony WH-1000XM5 Headphones",      "TVs & Audio",        28000),
    ("Canon EOS 2000D Camera",          "Cameras",            42000),
    ("Sony Alpha a6400",                "Cameras",            85000),
    ("GoPro Hero 12",                   "Cameras",            38000),
    ("Men's Polo Shirt",                "Men's Clothing",      1800),
    ("Men's Chino Trousers",            "Men's Clothing",      2500),
    ("Men's Leather Belt",              "Men's Clothing",       950),
    ("Women's Floral Dress",            "Women's Clothing",    2200),
    ("Women's Blazer",                  "Women's Clothing",    3500),
    ("Women's Wrap Skirt",              "Women's Clothing",    1600),
    ("Nike Air Max 270 (Men)",          "Shoes",               8500),
    ("Adidas Ultraboost 22 (Women)",    "Shoes",              10000),
    ("Leather Oxford Shoes",            "Shoes",               5500),
    ("Casual Sandals",                  "Shoes",               2200),
    ("Leather Handbag",                 "Accessories",         3800),
    ("Wristwatch – Classic",            "Accessories",         4500),
    ("Sunglasses – UV400",              "Accessories",         1200),
    ("3-Seater Sofa",                   "Furniture",          35000),
    ("Wooden Dining Table (6-seater)",  "Furniture",          28000),
    ("Queen Bed Frame",                 "Furniture",          22000),
    ("Non-stick Cooking Set (5pc)",     "Kitchenware",         4500),
    ("Electric Kettle 1.7L",            "Kitchenware",         2800),
    ("Microwave Oven 20L",              "Kitchenware",         9500),
    ("Duvet Set – King Size",           "Bedding",             5500),
    ("Pillow Memory Foam (2pk)",        "Bedding",             3200),
    ("Scented Candle Set",              "Decor",               1500),
    ("Wall Clock – Minimalist",         "Decor",               2200),
    ("Vitamin C Serum 30ml",            "Skincare",            1800),
    ("SPF 50 Sunscreen 100ml",          "Skincare",            1200),
    ("Moisturising Face Cream",         "Skincare",            2500),
    ("Argan Oil Hair Serum",            "Hair Care",           1600),
    ("Keratin Shampoo 500ml",           "Hair Care",           1100),
    ("Men's Perfume – Oud 100ml",       "Fragrances",          3500),
    ("Women's Perfume – Floral 75ml",   "Fragrances",          4200),
    ("Matte Lipstick Set (6 colours)",  "Makeup",              2200),
    ("Foundation – All Skin Tones",     "Makeup",              1900),
    ("Adjustable Dumbbell Set 20kg",    "Fitness Equipment",   8500),
    ("Yoga Mat – Non-slip",             "Fitness Equipment",   2200),
    ("Jump Rope – Speed",               "Fitness Equipment",    800),
    ("Camping Tent (4-person)",         "Outdoor Gear",       12000),
    ("Hiking Backpack 50L",             "Outdoor Gear",        5500),
    ("Men's Running Shorts",            "Sportswear",          1500),
    ("Women's Leggings – Compression",  "Sportswear",          2200),
    ("Avocados (1 dozen)",              "Fresh Produce",        600),
    ("Tomatoes 1kg",                    "Fresh Produce",        120),
    ("Assorted Fruit Basket",           "Fresh Produce",       2500),
    ("Mineral Water 500ml (12pk)",      "Beverages",            480),
    ("Freshly Roasted Coffee Beans 1kg","Beverages",           1800),
    ("Assorted Nuts Mix 500g",          "Snacks",              1200),
    ("Dark Chocolate 70% (6pk)",        "Snacks",               950),
    ("Greek Yoghurt 500ml",             "Dairy",                350),
    ("Cheddar Cheese Block 400g",       "Dairy",                680),
    ("Rich Dad Poor Dad – R. Kiyosaki", "Books",               1200),
    ("Atomic Habits – James Clear",     "Books",               1100),
    ("Wireless Keyboard & Mouse Combo", "Laptops",             3500),
]

FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer",
               "Michael", "Linda", "William", "Barbara", "David", "Elizabeth",
               "Aisha", "Kwame", "Fatima", "Amani", "Chidi", "Zara"]
LAST_NAMES  = ["Omondi", "Wanjiru", "Kamau", "Mwangi", "Otieno", "Njoroge",
               "Achieng", "Kimani", "Mutua", "Karanja", "Odhiambo", "Chebet"]

REVIEW_COMMENTS = [
    "Excellent product! Exceeded my expectations.",
    "Good value for money. Would recommend.",
    "Arrived quickly and well packaged.",
    "Quality is top notch. Very happy with this purchase.",
    "Works perfectly, just as described.",
    "Decent product. Not amazing but good for the price.",
    "Fast delivery. The item looks even better in person.",
    "I've bought this twice now. Always impressed.",
    "Solid build quality. Will last long.",
    "Great seller, very responsive to questions.",
]

COUPON_CODES = [
    ("SAVE10",   "percentage", 10,  500),
    ("SAVE20",   "percentage", 20, 1000),
    ("FLAT200",  "fixed",     200,  800),
    ("FLAT500",  "fixed",     500, 2000),
    ("NEWUSER",  "percentage", 15,    0),
    ("MKZLAUNCH","percentage", 25, 3000),
]

BANNER_DATA = [
    ("Mega Electronics Sale",     "Up to 40% off all gadgets",        "/electronics"),
    ("New Fashion Collection",    "Fresh arrivals every week",         "/fashion"),
    ("Home Makeover Deals",       "Transform your space for less",     "/home"),
    ("Flash Friday Offers",       "24-hour deals you can't miss",      "/flash-sales"),
]


# ─────────────────────────────────────────────────────────────────────────────
# Command
# ─────────────────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Seed the database with realistic sample data (67 products + all related models)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing seed data before seeding.",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("📦  Collecting images …"))
        try:
            images = _collect_images()
            self.stdout.write(self.style.SUCCESS(f"   Found {len(images)} image(s)."))
        except FileNotFoundError as exc:
            self.stdout.write(self.style.WARNING(str(exc)))
            self.stdout.write(self.style.WARNING("   Continuing WITHOUT images (fields will be empty)."))
            images = []

        if options["clear"]:
            self._clear()

        self.stdout.write(self.style.MIGRATE_HEADING("\n👤  Creating users …"))
        admin      = self._create_admin()
        vendors    = self._create_vendors(images)
        customers  = self._create_customers(images)

        self.stdout.write(self.style.MIGRATE_HEADING("\n📂  Creating categories …"))
        leaf_map   = self._create_categories(images)   # {leaf_name: Category}

        self.stdout.write(self.style.MIGRATE_HEADING("\n🏪  Creating stores …"))
        stores     = self._create_stores(vendors, images)

        self.stdout.write(self.style.MIGRATE_HEADING("\n🛒  Creating products …"))
        products   = self._create_products(stores, leaf_map, images)

        self.stdout.write(self.style.MIGRATE_HEADING("\n⭐  Creating reviews …"))
        self._create_reviews(products, customers)

        self.stdout.write(self.style.MIGRATE_HEADING("\n🛍️  Creating carts …"))
        self._create_carts(customers, products)

        self.stdout.write(self.style.MIGRATE_HEADING("\n❤️  Creating wishlists …"))
        self._create_wishlists(customers, products)

        self.stdout.write(self.style.MIGRATE_HEADING("\n📦  Creating orders …"))
        self._create_orders(customers, products, stores)

        self.stdout.write(self.style.MIGRATE_HEADING("\n🏷️  Creating coupons …"))
        self._create_coupons()

        self.stdout.write(self.style.MIGRATE_HEADING("\n🖼️  Creating banners …"))
        self._create_banners(images)

        self.stdout.write(self.style.MIGRATE_HEADING("\n⚡  Creating flash sales …"))
        self._create_flash_sales(products)

        self.stdout.write(self.style.SUCCESS("\n✅  Seeding complete!\n"))

    # ── clear ────────────────────────────────────────────────────────────────
    def _clear(self):
        self.stdout.write("   Clearing existing data …")
        FlashSale.objects.all().delete()
        Banner.objects.all().delete()
        Coupon.objects.all().delete()
        MpesaTransaction.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Wishlist.objects.all().delete()
        CartItem.objects.all().delete()
        Cart.objects.all().delete()
        Review.objects.all().delete()
        ProductVariant.objects.all().delete()
        ProductAttribute.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Store.objects.all().delete()
        Category.objects.all().delete()
        Address.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS("   Done."))

    # ── admin ────────────────────────────────────────────────────────────────
    def _create_admin(self):
        if not User.objects.filter(username="admin").exists():
            admin = User.objects.create_superuser(
                username="admin",
                email="admin@mkz.co.ke",
                password="Admin@1234",
                role="admin",
            )
            self.stdout.write(f"   Created superuser: admin / Admin@1234")
        else:
            admin = User.objects.get(username="admin")
            self.stdout.write("   Superuser 'admin' already exists – skipping.")
        return admin

    # ── vendors ──────────────────────────────────────────────────────────────
    def _create_vendors(self, images):
        vendors = []
        for username, fullname, _, _ in VENDOR_DATA:
            first, *last = fullname.split()
            v, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    first_name=first,
                    last_name=" ".join(last),
                    email=f"{username}@mkz.co.ke",
                    role="vendor",
                    phone_number=f"07{random.randint(10000000, 99999999)}",
                    is_active=True,
                ),
            )
            if created:
                v.set_password("Vendor@1234")
                if images:
                    v.avatar = _open_image_field(_random_image(images), "avatars")
                v.save()
                self.stdout.write(f"   Vendor: {username}")
            vendors.append(v)
        return vendors

    # ── customers ────────────────────────────────────────────────────────────
    def _create_customers(self, images):
        customers = []
        for i in range(1, 21):
            username = f"customer{i}"
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            c, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    first_name=fn,
                    last_name=ln,
                    email=f"{username}@example.com",
                    role="customer",
                    phone_number=f"07{random.randint(10000000, 99999999)}",
                    is_active=True,
                ),
            )
            if created:
                c.set_password("Customer@1234")
                if images:
                    c.avatar = _open_image_field(_random_image(images), "avatars")
                c.save()
                # address
                Address.objects.create(
                    user=c,
                    full_name=f"{fn} {ln}",
                    phone=c.phone_number,
                    county=random.choice(KENYAN_COUNTIES),
                    town=random.choice(KENYAN_TOWNS),
                    street=f"{random.randint(1, 999)} {random.choice(['Moi Ave', 'Kenyatta Rd', 'Uhuru Hwy', 'Tom Mboya St'])}",
                    is_default=True,
                )
            customers.append(c)
        self.stdout.write(f"   {len(customers)} customers ready.")
        return customers

    # ── categories ───────────────────────────────────────────────────────────
    def _create_categories(self, images):
        leaf_map = {}
        for cat_data in CATEGORY_DATA:
            parent, _ = Category.objects.get_or_create(
                slug=_slug(cat_data["name"]),
                defaults=dict(
                    name=cat_data["name"],
                    icon=cat_data.get("icon", ""),
                    image=_open_image_field(_random_image(images), "categories") if images else None,
                    is_active=True,
                ),
            )
            for child_name in cat_data.get("children", []):
                child, _ = Category.objects.get_or_create(
                    slug=_unique_slug(child_name, Category),
                    defaults=dict(
                        name=child_name,
                        parent=parent,
                        image=_open_image_field(_random_image(images), "categories") if images else None,
                        is_active=True,
                    ),
                )
                leaf_map[child_name] = child
        self.stdout.write(f"   {len(leaf_map)} leaf categories ready.")
        return leaf_map

    # ── stores ───────────────────────────────────────────────────────────────
    def _create_stores(self, vendors, images):
        stores = []
        for vendor, (_, _, store_name, desc) in zip(vendors, VENDOR_DATA):
            store, created = Store.objects.get_or_create(
                vendor=vendor,
                defaults=dict(
                    name=store_name,
                    slug=_unique_slug(store_name, Store),
                    description=desc,
                    logo=_open_image_field(_random_image(images), "stores/logos") if images else None,
                    banner=_open_image_field(_random_image(images), "stores/banners") if images else None,
                    is_verified=random.random() > 0.3,
                ),
            )
            stores.append(store)
            self.stdout.write(f"   Store: {store.name}")
        return stores

    # ── products ─────────────────────────────────────────────────────────────
    def _create_products(self, stores, leaf_map, images):
        products = []
        pool     = PRODUCT_POOL[:]          # 67 products defined in pool
        random.shuffle(pool)

        fallback_category = list(leaf_map.values())[0] if leaf_map else None

        for idx, (name, cat_name, base_price) in enumerate(pool):
            store    = stores[idx % len(stores)]
            category = leaf_map.get(cat_name, fallback_category)
            price    = Decimal(str(base_price)) + _rand_price(-200, 200)
            price    = max(price, Decimal("100"))
            disc     = _rand_discount(price)

            slug = _unique_slug(name, Product)
            sku  = f"SKU-{uuid.uuid4().hex[:8].upper()}"

            product = Product.objects.create(
                store=store,
                category=category,
                name=name,
                slug=slug,
                description=(
                    f"{name} – a top-quality product available at {store.name}. "
                    "Sourced for Kenyan customers who demand both value and reliability. "
                    "Fast nationwide delivery included."
                ),
                price=price,
                discounted_price=disc,
                stock=random.randint(5, 200),
                sku=sku,
                status=random.choices(["active", "active", "active", "inactive", "out_of_stock"], k=1)[0],
                is_featured=random.random() > 0.75,
                rating=Decimal(str(round(random.uniform(3.2, 5.0), 2))),
                review_count=random.randint(0, 120),
            )

            # images (2–4 per product)
            num_imgs = random.randint(2, 4)
            for i_idx in range(num_imgs):
                if images:
                    rel = _open_image_field(_random_image(images), "products")
                    ProductImage.objects.create(
                        product=product,
                        image=rel,
                        is_primary=(i_idx == 0),
                        order=i_idx,
                    )

            # attributes
            if cat_name in ("Men's Clothing", "Women's Clothing", "Sportswear"):
                for size in random.sample(["XS", "S", "M", "L", "XL", "XXL"], k=3):
                    ProductAttribute.objects.create(product=product, name="Size", value=size)
                for color in random.sample(["Black", "White", "Navy", "Grey", "Red"], k=2):
                    ProductAttribute.objects.create(product=product, name="Color", value=color)
            elif cat_name in ("Shoes",):
                for sz in random.sample(["38", "39", "40", "41", "42", "43", "44"], k=4):
                    ProductAttribute.objects.create(product=product, name="Size", value=sz)

            # variants (only for clothing & shoes)
            if cat_name in ("Men's Clothing", "Women's Clothing", "Shoes", "Sportswear"):
                for _ in range(random.randint(2, 4)):
                    v_price = price * Decimal(str(round(random.uniform(0.95, 1.1), 2)))
                    ProductVariant.objects.create(
                        product=product,
                        name=f"{name} variant {uuid.uuid4().hex[:4]}",
                        sku=f"VAR-{uuid.uuid4().hex[:8].upper()}",
                        price=v_price.quantize(Decimal("0.01")),
                        stock=random.randint(1, 50),
                        attributes={"color": random.choice(["Black", "White", "Navy"]),
                                    "size":  random.choice(["S", "M", "L", "XL"])},
                    )

            products.append(product)

        self.stdout.write(f"   {len(products)} products created.")
        return products

    # ── reviews ──────────────────────────────────────────────────────────────
    def _create_reviews(self, products, customers):
        count = 0
        seen  = set()
        for product in random.sample(products, min(50, len(products))):
            reviewers = random.sample(customers, min(random.randint(1, 6), len(customers)))
            for user in reviewers:
                key = (product.pk, user.pk)
                if key in seen:
                    continue
                seen.add(key)
                Review.objects.create(
                    product=product,
                    user=user,
                    rating=random.randint(3, 5),
                    title=random.choice(["Great!", "Good value", "Happy customer", "Recommended", ""]),
                    comment=random.choice(REVIEW_COMMENTS),
                    is_verified_purchase=random.random() > 0.4,
                )
                count += 1
        self.stdout.write(f"   {count} reviews created.")

    # ── carts ────────────────────────────────────────────────────────────────
    def _create_carts(self, customers, products):
        for customer in random.sample(customers, min(10, len(customers))):
            cart, _ = Cart.objects.get_or_create(user=customer)
            for product in random.sample(products, random.randint(1, 5)):
                if not CartItem.objects.filter(cart=cart, product=product).exists():
                    CartItem.objects.create(
                        cart=cart,
                        product=product,
                        quantity=random.randint(1, 3),
                    )
        self.stdout.write("   Carts seeded.")

    # ── wishlists ────────────────────────────────────────────────────────────
    def _create_wishlists(self, customers, products):
        count = 0
        for customer in customers:
            for product in random.sample(products, random.randint(1, 6)):
                Wishlist.objects.get_or_create(user=customer, product=product)
                count += 1
        self.stdout.write(f"   {count} wishlist entries created.")

    # ── orders ───────────────────────────────────────────────────────────────
    def _create_orders(self, customers, products, stores):
        statuses         = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
        payment_statuses = ["unpaid", "paid", "paid", "paid", "failed"]
        order_count = 0

        for customer in customers:
            address = customer.addresses.first()
            if not address:
                continue
            for _ in range(random.randint(1, 4)):
                items_data   = random.sample(products, random.randint(1, 5))
                shipping_fee = Decimal("200")
                subtotal     = Decimal("0")
                status       = random.choice(statuses)
                pay_status   = random.choice(payment_statuses)
                if status == "delivered":
                    pay_status = "paid"

                order = Order.objects.create(
                    user=customer,
                    shipping_address=address,
                    status=status,
                    payment_status=pay_status,
                    payment_method=random.choice(["mpesa", "card", "cash_on_delivery"]),
                    shipping_fee=shipping_fee,
                    subtotal=subtotal,
                    total=subtotal,
                    notes="" if random.random() > 0.3 else "Please handle with care.",
                )

                for product in items_data:
                    qty  = random.randint(1, 3)
                    unit = product.effective_price
                    sub  = unit * qty
                    subtotal += sub
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        store=product.store,
                        product_name=product.name,
                        quantity=qty,
                        unit_price=unit,
                        subtotal=sub,
                    )

                order.subtotal = subtotal
                order.total    = subtotal + shipping_fee
                order.save(update_fields=["subtotal", "total"])

                # M-Pesa transaction for paid orders
                if pay_status == "paid":
                    MpesaTransaction.objects.create(
                        order=order,
                        checkout_request_id=f"ws_CO_{uuid.uuid4().hex[:20].upper()}",
                        merchant_request_id=f"MR_{uuid.uuid4().hex[:12].upper()}",
                        phone_number=customer.phone_number or "0712345678",
                        amount=order.total,
                        status="success",
                        mpesa_receipt_number=f"RCP{uuid.uuid4().hex[:8].upper()}",
                        result_code="0",
                        result_description="The service request is processed successfully.",
                        transaction_date=timezone.now() - timedelta(days=random.randint(0, 60)),
                    )
                order_count += 1

        self.stdout.write(f"   {order_count} orders created.")

    # ── coupons ──────────────────────────────────────────────────────────────
    def _create_coupons(self):
        now = timezone.now()
        for code, dtype, value, min_amt in COUPON_CODES:
            Coupon.objects.get_or_create(
                code=code,
                defaults=dict(
                    discount_type=dtype,
                    discount_value=Decimal(str(value)),
                    min_order_amount=Decimal(str(min_amt)),
                    max_uses=random.randint(50, 500),
                    used_count=random.randint(0, 20),
                    valid_from=now - timedelta(days=5),
                    valid_to=now + timedelta(days=30),
                    is_active=True,
                ),
            )
        self.stdout.write(f"   {len(COUPON_CODES)} coupons seeded.")

    # ── banners ──────────────────────────────────────────────────────────────
    def _create_banners(self, images):
        for idx, (title, subtitle, link) in enumerate(BANNER_DATA):
            Banner.objects.get_or_create(
                title=title,
                defaults=dict(
                    subtitle=subtitle,
                    image=_open_image_field(_random_image(images), "banners") if images else "banners/placeholder.jpg",
                    link=link,
                    is_active=True,
                    order=idx,
                ),
            )
        self.stdout.write(f"   {len(BANNER_DATA)} banners seeded.")

    # ── flash sales ──────────────────────────────────────────────────────────
    def _create_flash_sales(self, products):
        now = timezone.now()
        flash1 = FlashSale.objects.create(
            title="Friday Flash Sale",
            start_time=now - timedelta(hours=2),
            end_time=now + timedelta(hours=22),
            is_active=True,
        )
        flash1.products.set(random.sample(products, min(10, len(products))))

        flash2 = FlashSale.objects.create(
            title="Weekend Mega Deals",
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=3),
            is_active=True,
        )
        flash2.products.set(random.sample(products, min(8, len(products))))
        self.stdout.write("   2 flash sales seeded.")