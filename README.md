# Mkurugenzi — Full-Stack E-Commerce Platform

> Kenya's Jumia-inspired marketplace with M-Pesa integration, built with Django REST Framework + React + Tailwind CSS.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Complete Project Structure](#3-complete-project-structure)
4. [Backend — File-by-File Explanation](#4-backend--file-by-file-explanation)
5. [Frontend — File-by-File Explanation](#5-frontend--file-by-file-explanation)
6. [Database Schema and Relationships](#6-database-schema-and-relationships)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [M-Pesa Integration Flow](#8-m-pesa-integration-flow)
9. [Authentication Flow](#9-authentication-flow)
10. [Setup and Installation](#10-setup-and-installation)
11. [Environment Variables](#11-environment-variables)
12. [Deployment Notes](#12-deployment-notes)

---

## 1. Project Overview

Mkurugenzi is a full-stack multi-vendor e-commerce marketplace tailored for the Kenyan market. Key features include:

- **Multi-vendor marketplace** — vendors can register stores and list products
- **M-Pesa STK Push payments** — customers pay via Lipa na M-Pesa directly from the platform
- **Full shopping flow** — browse > cart > checkout > order tracking
- **Product management** — variants (size/colour), multiple images, attributes, flash sales
- **Responsive design** — Jumia-inspired UI with mobile drawer, skeleton loading, and touch-friendly interactions
- **JWT authentication** — access and refresh token rotation
- **Reviews and ratings** — verified purchase badges, star ratings with distribution breakdown
- **Coupon system** — percentage or fixed-amount discount codes

---

## 2. Tech Stack

### Backend

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10+ | Runtime |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | REST API layer |
| djangorestframework-simplejwt | 5.3 | JWT authentication |
| django-cors-headers | 4.3 | Allow frontend requests |
| django-filter | 23.5 | Query filtering on viewsets |
| Pillow | 10.2 | Image upload handling |
| python-decouple | 3.8 | .env variable loading |
| PostgreSQL | 14+ | Primary database |
| requests | 2.31 | HTTP calls to Safaricom M-Pesa API |

### Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.1 | Development server and bundler |
| React Router DOM | 6.22 | Client-side routing |
| Axios | 1.6 | HTTP client for API calls |
| Zustand | 4.5 | Global state management |
| Tailwind CSS | 3.4 | Utility-first styling |
| react-hot-toast | 2.4 | Toast notifications |
| lucide-react | 0.323 | Icon library |

---

## 3. Complete Project Structure

```
mkurugenzi/
│
├── README.md                          <- This file
│
├── backend/
│   ├── manage.py                      <- Django management CLI
│   ├── requirements.txt               <- Python dependencies
│   ├── .env.example                   <- Environment variable template
│   │
│   ├── mkurugenzi/                    <- Django project package
│   │   ├── __init__.py
│   │   ├── settings.py                <- All Django configuration
│   │   ├── urls.py                    <- Root URL dispatcher
│   │   └── wsgi.py / asgi.py         <- WSGI/ASGI entry points
│   │
│   └── shop/                         <- Main Django app
│       ├── __init__.py
│       ├── admin.py                   <- Admin panel registrations
│       ├── apps.py                    <- App configuration
│       ├── models.py                  <- ALL database models (15 models)
│       ├── serializers.py             <- DRF serializers for API I/O
│       ├── views.py                   <- All ViewSets and business logic
│       ├── urls.py                    <- App URL router
│       └── migrations/               <- Auto-generated DB migrations
│
└── frontend/
    ├── package.json                   <- npm dependencies and scripts
    ├── vite.config.js                 <- Vite build configuration
    ├── tailwind.config.js             <- Tailwind customisation
    ├── postcss.config.js              <- PostCSS plugins
    ├── .env                           <- Frontend environment variables
    ├── index.html                     <- Root HTML shell
    │
    └── src/
        ├── main.jsx                   <- React entry point
        ├── App.jsx                    <- Route definitions
        ├── index.css                  <- Global styles + CSS variables
        │
        ├── services/
        │   └── api.js                 <- All Axios API calls organised by domain
        │
        ├── store/
        │   └── index.js               <- Zustand global state stores
        │
        ├── context/
        │   ├── AuthContext.jsx        <- Alternative React Context for auth
        │   └── CartContext.jsx        <- Alternative React Context for cart
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.jsx         <- Root page shell (Navbar + Outlet + Footer)
        │   │   ├── Navbar.jsx         <- Full top navigation bar
        │   │   ├── MobileDrawer.jsx   <- Slide-in mobile sidebar
        │   │   └── Footer.jsx         <- Site footer
        │   │
        │   └── product/
        │       └── ProductCard.jsx    <- Reusable product tile component
        │
        └── pages/
            ├── HomePage.jsx           <- Landing page (hero, categories, flash sale)
            ├── ProductListPage.jsx    <- Browse / search / filter products
            ├── ProductDetailPage.jsx  <- Single product with reviews + related
            ├── CartPage.jsx           <- Shopping cart management
            ├── CheckoutPage.jsx       <- 3-step checkout + M-Pesa modal
            ├── OrdersPage.jsx         <- Customer order list
            ├── OrderDetailPage.jsx    <- Single order with progress tracker
            ├── WishlistPage.jsx       <- Saved products list
            ├── ProfilePage.jsx        <- Account settings
            ├── LoginPage.jsx          <- Sign-in form
            ├── RegisterPage.jsx       <- Sign-up form
            ├── StorePage.jsx          <- Vendor store page
            ├── SearchPage.jsx         <- Search results alias
            └── NotFoundPage.jsx       <- 404 error page
```

---

## 4. Backend — File-by-File Explanation

### 4.1 `settings.py`

The central configuration file for the entire Django project.

**Secret key and debug mode:**
`SECRET_KEY` is the cryptographic key used for sessions, tokens, and signing. It must be changed in production. `DEBUG=True` shows detailed error pages; set it to `False` in production.

**AUTH_USER_MODEL:**
```python
AUTH_USER_MODEL = 'shop.User'
```
This tells Django to use our custom User model instead of the built-in one. It must be set before the first migration is run and cannot be changed afterwards.

**Installed apps:**
`rest_framework` adds the REST API layer. `corsheaders` allows the React frontend running on a different port to call the API. `django_filters` enables URL query filtering like `?min_price=1000`. `shop` is our main application.

**Database (PostgreSQL):**
All values are loaded from `.env` via python-decouple so no credentials are hardcoded in source code. The database name, user, password, host, and port are all configurable.

**JWT Configuration:**
Access tokens expire after 1 day. Refresh tokens last 30 days. When an access token expires, the frontend automatically uses the refresh token to get a new one without the user having to log in again.

**CORS:**
`CORS_ALLOWED_ORIGINS` lists `http://localhost:5173` and `http://localhost:3000` for development. Without this, the browser blocks the frontend from calling the API with a CORS error.

**M-Pesa Settings:**
All Safaricom API credentials are loaded from environment variables: Consumer Key, Consumer Secret, Shortcode, Passkey, Callback URL, and Environment (sandbox vs production).

**Media files:**
All uploaded files — product images, store logos, user avatars — are stored in the `media/` directory and served at `/media/` URLs.

---

### 4.2 `urls.py`

The root URL configuration. Every incoming HTTP request is matched against these patterns first. The admin panel sits at `/admin/`. All shop API routes live under `/api/`. The JWT token refresh endpoint is at `/api/token/refresh/`. In development, uploaded media files are also served by Django via `MEDIA_URL`.

The `shop/urls.py` uses a DRF Router which automatically generates URL patterns for every registered ViewSet, following REST conventions (GET for list, POST for create, GET `/{id}/` for detail, PATCH for update, DELETE for destroy).

---

### 4.3 `models.py`

This is the most important backend file. It defines all 15 database tables and their relationships.

**User (extends AbstractUser)**

The custom user model. Extending Django's built-in `AbstractUser` means we get username, password, email, and name fields for free, and we add `phone_number` (used for M-Pesa), `role` ('customer', 'vendor', or 'admin'), and `avatar` (profile picture). The `created_at` timestamp is auto-set on registration.

**Address**

Delivery addresses for a user. A user can have many addresses; one is marked as default. Stores `full_name`, `phone`, `county`, `town`, and `street`. The `is_default` flag is enforced at the view level — when one address is set as default, all others are unset.

**Store**

Represents a vendor's shop. Every vendor user can create one store (`OneToOneField`). Has a `name`, `slug` for URL routing, optional `logo` and `banner` images, and an `is_verified` flag that an admin can toggle for trusted sellers.

**Category**

Product categories with hierarchical structure. A `parent` field is a self-referential `ForeignKey` — top-level categories have `parent=None`. Child categories (e.g. "Phones" under "Electronics") reference the parent. The reverse relation `children` lets you get all subcategories.

**Product**

The core model. Every product belongs to a `Store` and a `Category`. Key fields are `price` (original MRP), `discounted_price` (sale price — if set, this is what customers pay), `stock` (inventory count), `sku` (unique product code), `status` ('active', 'inactive', 'draft'), `is_featured` (homepage display), `rating` (computed average), and `review_count`. The computed property `effective_price` returns the discounted price if set, otherwise the original price. The `discount_percent` property returns the integer savings percentage.

**ProductImage**

Multiple images per product. One is marked `is_primary` — this is the thumbnail shown in product cards and listings. The `order` field controls gallery display sequence.

**ProductAttribute**

Key-value pairs for product specifications, shown in the Specifications tab. For example: RAM = 8GB, Colour = Midnight Black, Weight = 185g.

**ProductVariant**

Variants of the same product (e.g. a phone in 64GB vs 128GB storage). Each variant has its own `sku`, optional `price` override, `stock` count, and an `attributes` JSONField (e.g. `{"storage": "128GB", "colour": "Black"}`).

**Review**

Customer product reviews. `rating` is an integer 1–5. `is_verified_purchase` is set to `True` automatically if the reviewer has a delivered order containing that product, showing the "Verified Purchase" badge.

**Cart and CartItem**

A persistent shopping basket. `Cart` is a one-to-one with User (one cart per user). `CartItem` stores each line item with a `unit_price` snapshot taken at the time of adding to the cart — this protects the customer from price increases while they are shopping. `subtotal` is a computed property of `unit_price × quantity`.

**Wishlist**

Saved/favourited products. A `unique_together` constraint on `[user, product]` prevents the same item being saved twice.

**Order and OrderItem**

Completed purchases. `Order` has the `order_number` (auto-generated like "MK-2025-000042"), status progression from 'pending' through 'delivered', payment method and status, financial totals, and a reference to the delivery address. `OrderItem` snapshots the `product_name` and `product_image` at order time so the order history stays accurate even if the product is later edited or deleted.

**MpesaTransaction**

Tracks every M-Pesa STK Push attempt. `checkout_request_id` is Safaricom's reference used to poll for status. `mpesa_receipt_number` is the confirmation code provided on success. `result_code` '0' means success; anything else is a failure. `status` is one of 'pending', 'success', 'failed', 'cancelled', or 'timeout'.

**Coupon**

Discount codes. `discount_type` is either 'percentage' or 'fixed'. `max_uses` can be set to an integer limit or `None` for unlimited. `valid_from` and `valid_until` control the active date range. The `used_count` increments each time a coupon is applied to an order.

**Banner**

Homepage hero banners managed via the Django admin panel. Each has a `title`, `subtitle`, `image`, `link` URL, display `order`, and `is_active` toggle.

**FlashSale**

Time-limited promotions for specific products. The `starts_at` and `ends_at` datetimes define the window. The `is_active` flag is an additional manual toggle.

---

### 4.4 `serializers.py`

Serializers translate between Django model instances and JSON. They also validate incoming data before saving to the database.

**RegisterSerializer** validates and creates a new user. It checks that `password` and `password2` match, then calls `User.objects.create_user()` which hashes the password before storing it.

**UserSerializer** converts the User model to JSON for the `/api/auth/me/` endpoint. The `id` field is read-only — the client can never submit an id to change.

**CategorySerializer** includes a recursive nested `children` list, producing a hierarchy in the JSON response where top-level categories contain their subcategories.

**ProductListSerializer** is a lightweight version used in list views. It only includes fields needed for product cards (id, name, slug, price, primary_image, rating, discount_percent) to keep response payloads small.

**ProductDetailSerializer** is the full version for the detail page. It embeds nested serializers for `images`, `variants`, `attributes`, `store`, and `category` so the frontend gets everything in one request.

**CartSerializer** includes computed fields: `total` (sum of all item subtotals) and `item_count` (total units across all items), both calculated via `SerializerMethodField`.

**OrderSerializer** embeds `items` as nested `OrderItemSerializer` and `shipping_address_detail` as a nested `AddressSerializer` for the address snapshot.

**STKPushSerializer** validates M-Pesa payment initiation. It checks that the phone number is in a recognised Kenyan format and converts it to the international format required by Safaricom (e.g. 07XXXXXXXX becomes 2547XXXXXXXX).

---

### 4.5 `views.py`

All business logic lives here, organised into ViewSets.

**AuthViewSet** handles register, login, get own profile (`me`), update profile, and change password. On login and register, the backend generates JWT access and refresh tokens and returns them along with the user object so the frontend can store everything in a single response.

**AddressViewSet** auto-assigns the `user` field from `request.user` — clients cannot set or change which user an address belongs to. When `is_default=True` is set on a new or updated address, the view automatically sets all other addresses for that user to `is_default=False`.

**ProductViewSet** supports rich filtering via URL query parameters: `search` for full-text search on name and description, `category` for filtering by category slug, `min_price` and `max_price` for price range, `min_rating` for star rating threshold, `ordering` for sort order, and `is_featured` for homepage products. The `add_review` action automatically checks whether the reviewer has a delivered order containing the product and sets `is_verified_purchase` accordingly.

**CartViewSet** manages the shopping basket. The `add_item` action finds or creates the user's cart, then checks if the product+variant combination already exists in the cart. If yes, it increments the quantity. If no, it creates a new `CartItem` with the current price snapshotted as `unit_price`.

**OrderViewSet `create_order`** is the most complex operation:
1. Validates the selected address belongs to the authenticated user
2. Validates the coupon if provided (not expired, min order met, usage limit not reached)
3. Checks every cart item is still in stock
4. Deducts stock from each product
5. Creates the Order and all OrderItem records
6. Applies coupon discount and calculates shipping fee (free if subtotal >= KES 2,000)
7. Clears the cart
8. Returns the new order

The `cancel_order` action only allows cancellation if the status is 'pending' or 'confirmed'. It restores stock quantities to each product.

**MpesaService** is a helper class (not a ViewSet) that wraps the Safaricom Daraja API. `get_access_token()` calls Safaricom's OAuth endpoint and caches the result for an hour to avoid unnecessary API calls. `get_password()` creates the STK Push password as `base64(shortcode + passkey + timestamp)`. `stk_push()` sends the actual payment request. `query_stk_status()` checks a pending payment's current status.

**MpesaViewSet `callback`** is the webhook endpoint that Safaricom calls when a payment completes (success or failure). It parses the `Body.stkCallback` object from Safaricom's JSON, extracts the `ResultCode` (0 = success), updates the `MpesaTransaction` record, and marks the order as paid if successful. This endpoint must be publicly accessible — in development this means exposing port 8000 via ngrok.

**CouponViewSet `validate`** checks a coupon code against all validation rules (existence, expiry date, minimum order amount, usage limit) and returns the calculated discount amount if valid.

---

### 4.6 `requirements.txt`

```
Django==4.2.9
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
django-filter==23.5
python-decouple==3.8
Pillow==10.2.0
requests==2.31.0
```

You should also add `psycopg2-binary==2.9.9` for the PostgreSQL driver and `gunicorn==21.2.0` for the production web server.

---

### 4.7 `.env.example`

A template file showing every required environment variable. Copy it to `.env` before running the server. The `.env` file is never committed to version control (it is in `.gitignore`) because it contains secrets.

---

## 5. Frontend — File-by-File Explanation

### 5.1 `main.jsx`

The absolute entry point of the React application. It imports `index.css` (loading all global styles and fonts) and mounts the `<App/>` component into the `<div id="root">` element in `index.html`.

---

### 5.2 `App.jsx`

Defines all client-side routes using React Router v6. The route tree places most pages inside the `<Layout/>` component so they all get the shared Navbar and Footer. Login and Register are outside the layout because they use full-page designs.

The `PrivateRoute` wrapper component reads `isAuthenticated` from the Zustand auth store. If the user is not logged in, they are redirected to `/login` with a `state.from` object so they return to their intended page after authenticating.

Route overview:
- `/` — HomePage
- `/products` — ProductListPage (all products)
- `/products/:slug` — ProductDetailPage
- `/category/:slug` — ProductListPage filtered by category
- `/cart` — CartPage (public)
- `/wishlist` — WishlistPage (protected)
- `/checkout` — CheckoutPage (protected)
- `/orders` — OrdersPage (protected)
- `/orders/:id` — OrderDetailPage (protected)
- `/profile` — ProfilePage (protected)
- `/stores/:slug` — StorePage (public)
- `/login` — LoginPage (no layout)
- `/register` — RegisterPage (no layout)
- `*` — NotFoundPage

---

### 5.3 `index.css`

Global stylesheet with three responsibilities:

**Google Fonts import:** Loads Nunito Sans (used for body text — clean and readable) and Nunito (used for headings and prices — bold and distinctive).

**CSS custom properties:** Defines the Jumia colour palette as CSS variables — `--jumia-orange: #f68b1e`, `--jumia-red: #e74c3c`, `--jumia-green: #27ae60`, and layout colours. Using variables means a single change updates the colour everywhere.

**Reusable utility classes:** The file defines `.product-card` (white card with hover lift), `.btn-primary` and `.btn-outline` (button variants), `.form-input` (styled inputs with orange focus ring), `.skeleton` (animated shimmer placeholder), `.section-header` and `.section-title` (homepage section headings with orange bottom border), `.badge-discount` and `.badge-new` (product badge pills), `.status-pending`, `.status-shipped` etc. (order status colour chips), `.countdown-box` (flash sale timer digit boxes), `.drawer-panel` and `.drawer-overlay` (mobile sidebar animation with `slideIn` keyframe), and `.scroll-x` (horizontal scroll without visible scrollbar).

---

### 5.4 `services/api.js`

A single file containing every API call in the application, organised by domain. This centralisation means if the backend URL or an endpoint changes, there is exactly one place to update it.

**The Axios instance** uses `VITE_API_URL` from the `.env` file, falling back to `http://localhost:8000/api`.

**Request interceptor** reads the access token from `localStorage` and automatically attaches it as a `Bearer` token in the `Authorization` header of every request. No individual API function needs to handle authentication.

**Response interceptor** handles token expiry. When a 401 response is received, it attempts to call `/token/refresh/` with the stored refresh token. If successful, it saves the new access token and retries the original request transparently. If the refresh also fails (token expired or invalid), it clears both tokens from storage and redirects to `/login`.

Exported API modules:
- `authAPI` — register, login, me, updateProfile, changePassword
- `productsAPI` — list (with params), detail, featured, byCategory, reviews, addReview
- `cartAPI` — get, add, update, remove, clear
- `orderAPI` — list, detail, create, cancel
- `addressAPI` — list, create, update, delete
- `wishlistAPI` — get, toggle
- `mpesaAPI` — stkPush, status
- `couponAPI` — validate
- `categoriesAPI` — list, detail
- `storesAPI` — list, detail, products
- `bannersAPI` — list

---

### 5.5 `store/index.js`

Global state management using Zustand. Three stores are defined.

**Why Zustand?** It is simpler than Redux — no reducers, actions, or dispatch. State is just a plain object with functions that call `set()` to update it. The entire auth store fits in about 30 lines.

**useAuthStore** is persisted to `localStorage` so the user stays logged in across page refreshes and tab closures. The `partialize` option means only `user` and `isAuthenticated` are saved to storage (not the async functions, which cannot be serialised). `login()` calls the API, saves both tokens to localStorage, and sets the user object in state. `logout()` removes both tokens and resets state to unauthenticated.

**useCartStore** holds the cart object fetched from the backend. `fetchCart()` is called on app load (for authenticated users) and after every cart mutation to keep the UI in sync. `addToCart()` calls the add endpoint and then calls `fetchCart()` so the cart badge count updates immediately. `updateItem()` also handles the case where the new quantity is 0 — it calls `removeItem()` instead.

**useWishlistStore** maintains both the `wishlist` array (for rendering the wishlist page) and a `wishlistIds` Set (for O(1) lookup). `isWishlisted(productId)` is called on every `ProductCard` render to decide whether to show a filled or empty heart icon. Using a Set instead of `array.find()` is important for performance when there are hundreds of product cards on a page.

---

### 5.6 Layout Components

**`Layout.jsx`** is the shell wrapping all main pages. It renders `<Navbar/>`, then `<Outlet/>` (where React Router inserts the current page), then `<Footer/>`. It also calls `fetchCart()` via a `useEffect` whenever `isAuthenticated` changes — this ensures the cart badge is populated immediately after login.

**`Navbar.jsx`** is the full navigation header with three horizontal layers:

The top info bar (desktop only) shows a phone number, location indicator, and a "Sell on Mkurugenzi" link.

The main orange bar contains the mobile hamburger button, the Mkurugenzi logo and wordmark, a full-width search bar with an orange submit button, a user account dropdown (showing the user's name if logged in, or Login/Register links if not), a wishlist link (desktop only), and the cart icon with an item count badge in yellow. The badge is driven by `cart.item_count` from the cart store and updates in real-time.

The category bar (desktop only) has an "All Categories" dropdown with all 8 main categories, plus quick links for Flash Sale, New Arrivals, and the top 5 categories.

Both the user dropdown and category dropdown are closed when clicking outside them using a `mousedown` event listener on `document` combined with a `useRef` on the container element.

**`MobileDrawer.jsx`** slides in from the left for mobile navigation. It shows a user greeting header (with login/register buttons if not authenticated), links to My Account, My Orders, My Wishlist, Flash Sale, New Arrivals, and the full category list. It automatically closes when the user navigates to a new route (via `useLocation` effect), when the backdrop overlay is clicked, or when the X button is pressed.

**`Footer.jsx`** has an orange app download banner at the top, then four content columns (Brand, Quick Links, Customer Service, Contact), and a bottom row showing accepted payment methods and copyright information.

---

### 5.7 Pages

**`HomePage.jsx`** mirrors Jumia Kenya's landing page layout. The `HeroBanner` component is a self-contained carousel with auto-advance every 5 seconds, manual prev/next arrow buttons, and dot indicators. All section data is loaded simultaneously using `Promise.allSettled()` — this means even if one API call fails (e.g. banners), the rest of the page still renders. Fallback data (default categories, placeholder banners) is shown immediately so the page never appears empty. Skeleton shimmer placeholders fill the product grids while loading.

The `CountdownTimer` component updates every second using `setInterval`. Each digit is displayed in a dark square box styled to look like Jumia's flash sale countdown.

**`ProductListPage.jsx`** serves three URL patterns: `/products`, `/category/:slug`, and `/search`. It uses `useParams()` to detect if there is a category slug and `useSearchParams()` to read the search query. Filters are stored in a single `filters` state object and sent as URL params to the products API. Filter changes reset the page to 1 via `setPage(1)` so users always see the most relevant results. On desktop, filters are shown in a sticky left sidebar. On mobile, pressing the Filter button opens a full-screen slide-in panel with the same filter controls.

**`ProductDetailPage.jsx`** loads three resources in parallel: the product detail, its reviews, and a set of related products. The image gallery uses `imgIdx` state to track the currently displayed image. Variant selection is managed by `selectedVariant` state — clicking a variant highlights it and its price is shown alongside the button. The reviews tab includes a rating distribution bar chart (calculating how many reviews are at each star level), individual review cards with verified purchase badges, and a write-review form for authenticated users. The related products grid at the bottom filters out the current product from the results.

**`CartPage.jsx`** renders the cart items list and order summary. Quantity controls call `updateItem()` directly. If the user is not authenticated when clicking "Proceed to Checkout", they are sent to `/login` with `state.from = { pathname: '/checkout' }` so they return to checkout after logging in.

**`CheckoutPage.jsx`** implements a 3-step wizard. Step 0 (Delivery) shows saved addresses as radio buttons and an inline "Add New Address" form. Step 1 (Payment) offers M-Pesa or Cash on Delivery. Step 2 (Confirm) shows a summary and the final "Place Order" button. Past steps are shown in a collapsed, faded state with an "Edit" link. When M-Pesa is selected and the order is placed, the `MpesaModal` appears asking for the phone number and triggering the STK Push. The `PaymentStatusModal` then shows the polling state and eventual success or failure. The polling interval reference is stored in `pollRef.current` and cleared in a `useEffect` cleanup function to prevent memory leaks if the component unmounts during polling.

**`OrdersPage.jsx`** lists all orders for the user. Filtering by status is done client-side on the already-fetched `orders` array — no additional API call is needed. Each order row shows the order number, colour-coded status badge, payment status badge, item count, date, and total.

**`OrderDetailPage.jsx`** shows the visual 5-step progress tracker. The tracker uses `stepIdx = STEPS.indexOf(order.status)` to determine how far along the order is. Steps before the current one show green checkmarks; the current step shows in orange; future steps are grey. A horizontal progress line fills from left to right as steps complete. The cancel button only renders when `status` is 'pending' or 'confirmed'.

**`ProfilePage.jsx`** uses sidebar tab navigation. The Profile tab edits the user's name, email, and phone, calling `PATCH /api/auth/update_profile/`. The Security tab handles password change with a current-password verification step. The Addresses tab lazily loads addresses only when the tab is first clicked (`loadedAddr` ref pattern), avoiding an unnecessary API call if the user never visits that tab.

**`LoginPage.jsx`** uses a split-screen layout. The left half (visible only on large screens) is a brand showcase with statistics. The right half is the login form. After successful login, `navigate(from, { replace: true })` returns the user to their intended destination or `/` as default.

**`RegisterPage.jsx`** includes radio card options for Customer vs Vendor account type. On successful registration, the API returns JWT tokens so the user is immediately authenticated and redirected to the homepage without needing to log in separately.

---

### 5.8 Product Components

**`ProductCard.jsx`** is the most reused component in the app. It appears in every product grid on the site. The component handles its own loading state (`addingCart` boolean) for the "Add to Cart" button. `isWishlisted` is derived from the wishlist store's Set lookup rather than a linear array search, so it remains fast even with large wishlists. The wishlist heart button appears on hover for desktop (using the `group-hover:opacity-100` Tailwind pattern) but is always visible when the item is already wishlisted. The "Add to Cart" button is always visible on mobile and revealed on hover on desktop.

---

## 6. Database Schema and Relationships

```
User ─────────────────────────────────┐
  │ one-to-one                         │
  ▼                                    ▼
Store ────────── Product            Address
  │                │
  │                ├── ProductImage
  │                ├── ProductVariant
  │                ├── ProductAttribute
  │                └── FlashSale
  │
User ──── Cart ──── CartItem ──── Product + ProductVariant
User ──── Wishlist ──── Product
User ──── Review ──── Product
User ──── Order ──── OrderItem ──── Product + ProductVariant
                │
                ├── Address (snapshot)
                └── MpesaTransaction

Category ──── Category (self-referential parent/children)
Category ──── Product
```

---

## 7. API Endpoints Reference

### Authentication

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register/ | No | Create account |
| POST | /api/auth/login/ | No | Get JWT tokens |
| GET | /api/auth/me/ | Yes | Get own profile |
| PATCH | /api/auth/update_profile/ | Yes | Update profile |
| POST | /api/auth/change_password/ | Yes | Change password |
| POST | /api/token/refresh/ | No | Refresh access token |

### Products and Categories

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /api/products/ | No | List products (filterable) |
| GET | /api/products/{slug}/ | No | Product detail |
| GET | /api/products/featured/ | No | Featured products |
| GET | /api/products/category/{slug}/ | No | Products by category |
| GET | /api/products/{slug}/reviews/ | No | Product reviews |
| POST | /api/products/{slug}/add_review/ | Yes | Submit review |
| GET | /api/categories/ | No | All categories |

### Cart

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /api/cart/my_cart/ | Yes | Get cart |
| POST | /api/cart/add_item/ | Yes | Add item |
| PATCH | /api/cart/update_item/ | Yes | Update quantity |
| DELETE | /api/cart/remove_item/ | Yes | Remove item |
| POST | /api/cart/clear/ | Yes | Clear cart |

### Orders

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /api/orders/my_orders/ | Yes | List orders |
| GET | /api/orders/{id}/ | Yes | Order detail |
| POST | /api/orders/create_order/ | Yes | Place order |
| POST | /api/orders/{id}/cancel/ | Yes | Cancel order |

### M-Pesa

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/mpesa/stk-push/ | Yes | Initiate STK Push |
| GET | /api/mpesa/status/{checkout_id}/ | Yes | Poll payment status |
| POST | /api/mpesa/callback/ | No | Safaricom webhook |

### Misc

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | /api/addresses/ | Yes | List addresses |
| POST | /api/addresses/ | Yes | Create address |
| GET | /api/wishlist/my_wishlist/ | Yes | Get wishlist |
| POST | /api/wishlist/toggle/ | Yes | Add/remove from wishlist |
| POST | /api/coupons/validate/ | Yes | Validate coupon code |
| GET | /api/banners/ | No | Homepage banners |
| GET | /api/stores/ | No | List all stores |
| GET | /api/stores/{slug}/ | No | Store detail |
| GET | /api/stores/{slug}/products/ | No | Store products |

### Supported Query Parameters for /api/products/

| Param | Example | Description |
|-------|---------|-------------|
| search | ?search=iphone | Full-text search on name and description |
| category | ?category=phones | Filter by category slug |
| min_price | ?min_price=1000 | Minimum price in KES |
| max_price | ?max_price=50000 | Maximum price in KES |
| min_rating | ?min_rating=4 | Minimum star rating (1–5) |
| ordering | ?ordering=-price | Sort field. Prefix with - for descending |
| is_featured | ?is_featured=true | Homepage featured products only |
| page | ?page=2 | Pagination (20 results per page) |

---

## 8. M-Pesa Integration Flow

```
Customer          Frontend              Backend              Safaricom
    │                 │                    │                    │
    │  Click Pay       │                    │                    │
    │────────────────>│                    │                    │
    │                 │  POST /stk-push/   │                    │
    │                 │───────────────────>│                    │
    │                 │                    │  GET /oauth/token  │
    │                 │                    │──────────────────>│
    │                 │                    │<──────────────────│
    │                 │                    │  POST /stkpush     │
    │                 │                    │──────────────────>│
    │                 │                    │<──────────────────│
    │                 │  { checkout_id }   │  checkout_req_id  │
    │                 │<───────────────────│                    │
    │  📱 STK Popup   │                    │                    │
    │<────────────────────────────────────────────────────────│
    │  Customer types PIN                   │                    │
    │────────────────────────────────────────────────────────>│
    │                 │  (Poll every 5s)   │                    │
    │                 │  GET /status/id    │                    │
    │                 │───────────────────>│                    │
    │                 │  { pending }       │                    │
    │                 │<───────────────────│                    │
    │                 │                    │  POST /callback/   │
    │                 │                    │<──────────────────│
    │                 │                    │  result_code: "0"  │
    │                 │  GET /status/id    │                    │
    │                 │───────────────────>│                    │
    │                 │  { success }       │                    │
    │                 │<───────────────────│                    │
    │  Payment OK     │                    │                    │
```

**Step-by-step:**
1. User enters phone number and clicks "Send STK Push" in the checkout modal
2. Frontend POSTs to `/api/mpesa/stk-push/` with phone and amount
3. Backend calls Safaricom's OAuth endpoint to get an access token (cached for 1 hour)
4. Backend POSTs the STK Push request to Safaricom
5. Safaricom returns a `CheckoutRequestID` and sends a popup to the customer's phone
6. Backend saves a `MpesaTransaction` with status='pending' and returns the `CheckoutRequestID` to the frontend
7. Frontend starts polling `/api/mpesa/status/{checkout_id}/` every 5 seconds
8. Customer enters their M-Pesa PIN on their phone
9. Safaricom POSTs the result to our callback URL (`/api/mpesa/callback/`)
10. Backend updates the MpesaTransaction status to 'success' or 'failed' and marks the order as paid
11. Frontend's next poll receives `status: success` and shows the success modal

---

## 9. Authentication Flow

**Login:**
1. User submits credentials to `POST /api/auth/login/`
2. Backend validates and returns `{ access: "...", refresh: "...", user: {...} }`
3. Frontend saves access token and refresh token to `localStorage`
4. User object is saved to Zustand auth store (persisted to localStorage)

**Authenticated request:**
Every request automatically includes `Authorization: Bearer {access_token}` via the Axios request interceptor.

**Token refresh:**
When a 401 response is received, the Axios response interceptor automatically calls `POST /api/token/refresh/` with the stored refresh token. If successful, the new access token is saved and the original request is retried. If the refresh fails, both tokens are cleared and the user is redirected to `/login`.

**Logout:**
Clears both tokens from localStorage and resets the Zustand auth store to unauthenticated state.

---

## 10. Setup and Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- ngrok (for testing M-Pesa callbacks in development)

### Backend Setup

```bash
# 1. Navigate to backend directory
cd mkurugenzi/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Open .env and fill in your PostgreSQL credentials and M-Pesa keys

# 5. Create the database
psql -U postgres -c "CREATE DATABASE mkurugenzi_db;"

# 6. Run database migrations (creates all tables)
python manage.py makemigrations shop
python manage.py migrate

# 7. Create an admin superuser
python manage.py createsuperuser

# 8. Start the development server
python manage.py runserver
# API: http://localhost:8000/api/
# Admin panel: http://localhost:8000/admin/
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd mkurugenzi/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 4. Start the development server
npm run dev
# App: http://localhost:5173
```

### M-Pesa Sandbox Setup

```bash
# 1. Register at developer.safaricom.co.ke
# 2. Create a new app to get Consumer Key and Consumer Secret
# 3. Use sandbox shortcode 174379 and the passkey from the portal

# 4. Expose your local server for Safaricom's webhook
npm install -g ngrok
ngrok http 8000
# Copies a public URL like https://abc123.ngrok.io

# 5. Update your .env file:
# MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback/

# 6. Restart Django server

# 7. Test with Safaricom's sandbox test number:
# Phone: 254708374149  |  PIN: 1234
```

### Seed Sample Data

```bash
python manage.py shell

from shop.models import Category, User, Store, Product

# Create categories
electronics = Category.objects.create(name='Electronics', slug='electronics')
phones = Category.objects.create(name='Phones', slug='phones', parent=electronics)

# Create a vendor
vendor = User.objects.create_user('vendor1', 'vendor@test.com', 'pass123')
vendor.role = 'vendor'
vendor.save()
store = Store.objects.create(vendor=vendor, name='TechKe', slug='techke')

# Create products
Product.objects.create(
    store=store, category=phones,
    name='Samsung Galaxy A55', slug='samsung-galaxy-a55',
    price=45000, discounted_price=39000, stock=50, is_featured=True
)
exit()
```

---

## 11. Environment Variables

### Backend `.env`

| Variable | Example | Description |
|----------|---------|-------------|
| SECRET_KEY | django-insecure-xyz | Django secret key — generate a new random one for production |
| DEBUG | True | Set to False in production |
| ALLOWED_HOSTS | localhost,mysite.co.ke | Comma-separated allowed domains |
| DB_NAME | mkurugenzi_db | PostgreSQL database name |
| DB_USER | postgres | Database username |
| DB_PASSWORD | mypassword | Database password |
| DB_HOST | localhost | Database hostname |
| DB_PORT | 5432 | Database port |
| MPESA_CONSUMER_KEY | abc123 | From Safaricom Developer Portal |
| MPESA_CONSUMER_SECRET | xyz789 | From Safaricom Developer Portal |
| MPESA_SHORTCODE | 174379 | Your paybill or till number |
| MPESA_PASSKEY | bfb279... | STK Push passkey from Safaricom |
| MPESA_CALLBACK_URL | https://xxx.ngrok.io/api/mpesa/callback/ | Must be publicly accessible |
| MPESA_ENVIRONMENT | sandbox | Use production when going live |

### Frontend `.env`

| Variable | Example | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8000/api | Backend API base URL |

---

## 12. Deployment Notes

### Backend (DigitalOcean, Railway, Render, etc.)

```bash
# 1. Set all environment variables on your hosting platform dashboard
# 2. Set DEBUG=False
# 3. Generate a new, strong SECRET_KEY
# 4. Add your production domain to ALLOWED_HOSTS
# 5. Install gunicorn: pip install gunicorn
# 6. Collect static files: python manage.py collectstatic
# 7. Start with: gunicorn mkurugenzi.wsgi:application --workers 3
# 8. Serve media files via nginx or a CDN (Cloudflare R2, AWS S3)
```

### Frontend (Vercel, Netlify, etc.)

```bash
# 1. Set VITE_API_URL to your production backend URL
# 2. Build: npm run build  (outputs to dist/ folder)
# 3. Deploy the dist/ folder
# 4. Add a redirect rule: /* -> /index.html (status 200)
#    This is required for React Router to work correctly
```

### M-Pesa Production Checklist

- Apply for M-Pesa API production access at developer.safaricom.co.ke
- Replace sandbox credentials with production Consumer Key, Secret, Shortcode, and Passkey
- Set `MPESA_ENVIRONMENT=production` in `.env`
- Set `MPESA_CALLBACK_URL` to your live HTTPS backend URL
- Test with a small real transaction (KES 1) before going live
- Set up monitoring/logging for the callback endpoint

### Security Checklist for Production

- Change `SECRET_KEY` to a long random string
- Set `DEBUG=False`
- Use HTTPS everywhere (SSL certificate via Let's Encrypt)
- Set `CORS_ALLOWED_ORIGINS` to only your frontend domain
- Use strong PostgreSQL password
- Set up database backups
- Configure file upload size limits in nginx

---

*Mkurugenzi means "Director" in Swahili — the one who makes things happen.*

*Built for the Kenyan market with M-Pesa at its heart.*