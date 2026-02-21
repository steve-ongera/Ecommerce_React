# Mkurugenzi E-Commerce Platform

Kenya's marketplace — similar to Jumia. Built with Django REST Framework + React + M-Pesa.

---

## 📁 Project Structure

```
mkurugenzi/
├── backend/               # Django project
│   ├── models.py          # All models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # ViewSets (includes M-Pesa)
│   ├── urls.py            # App URL router
│   ├── project_urls.py    # Main project URLs
│   ├── settings.py        # Django settings
│   └── requirements.txt
└── frontend/              # React (Vite + Tailwind)
    └── src/
        ├── pages/         # All route pages
        ├── components/    # Reusable components
        ├── store/         # Zustand state management
        └── services/      # Axios API layer
```

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create Django project structure
django-admin startproject mkurugenzi .
python manage.py startapp shop

# Copy files:
# - models.py, serializers.py, views.py, urls.py → shop/
# - settings.py → mkurugenzi/settings.py
# - project_urls.py → mkurugenzi/urls.py

# Setup env
cp .env.example .env
# Edit .env with your credentials

# Migrate and run
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env    # already created as .env
npm run dev
```

---

## 🔑 Key Models

| Model | Description |
|-------|-------------|
| `User` | Extended Django user with phone, role (customer/vendor/admin) |
| `Store` | Vendor shop with logo, banner, verification |
| `Category` | Hierarchical categories with slugs |
| `Product` | Full product with variants, images, attributes |
| `Cart / CartItem` | Per-user shopping cart |
| `Order / OrderItem` | Complete order with status tracking |
| `MpesaTransaction` | STK Push + callback tracking |
| `Coupon` | Percentage or fixed discount codes |

---

## 📱 M-Pesa Integration (Daraja API)

### Flow:
1. User places order → frontend calls `POST /api/mpesa/stk-push/`
2. Backend initiates STK Push to user's phone
3. User enters PIN on phone
4. Safaricom calls `POST /api/mpesa/callback/` (webhook)
5. Backend marks order as paid
6. Frontend polls `GET /api/mpesa/status/{checkout_id}/` every 5s

### Sandbox Testing:
- Get credentials at: https://developer.safaricom.co.ke
- Use test phone: 254708374149
- Use sandbox shortcode: 174379

### Expose callback URL (local dev):
```bash
ngrok http 8000
# Set MPESA_CALLBACK_URL=https://xxxx.ngrok.io/api/mpesa/callback/
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login (returns JWT) |
| GET | `/api/auth/me/` | Current user |
| GET | `/api/products/` | List products (filterable) |
| GET | `/api/products/{slug}/` | Product detail |
| GET | `/api/products/featured/` | Featured products |
| GET | `/api/products/category/{slug}/` | Products by category |
| GET/POST | `/api/cart/my_cart/` | Get/manage cart |
| POST | `/api/orders/create/` | Place order |
| POST | `/api/mpesa/stk-push/` | Initiate M-Pesa payment |
| POST | `/api/mpesa/callback/` | M-Pesa webhook |
| GET | `/api/mpesa/status/{id}/` | Check payment status |
| POST | `/api/coupons/validate/` | Validate coupon code |

---

## 🎨 Frontend Pages

- `/` — Homepage with banners, featured products, flash sales
- `/products` — Product listing with filters & sorting
- `/products/:slug` — Product detail with variants, reviews
- `/cart` — Shopping cart
- `/checkout` — Multi-step checkout with M-Pesa integration
- `/orders` — Order history
- `/orders/:id` — Order detail with tracking
- `/wishlist` — Saved products
- `/profile` — User profile & password management
- `/category/:slug` — Products by category
- `/search?q=term` — Search results
- `/stores/:slug` — Vendor store page

---

## 🔧 Tech Stack

**Backend:** Django 4.2 · DRF · SimpleJWT · PostgreSQL · M-Pesa Daraja API

**Frontend:** React 18 · Vite · Tailwind CSS · Zustand · React Router v6 · Axios · React Hot Toast