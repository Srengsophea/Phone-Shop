# PhoneHub — Production-Ready Full-Stack Phone Shop E-Commerce Platform

PhoneHub is an enterprise-grade, full-stack smartphone e-commerce platform built with **Laravel 13 (PHP 8.3)**, **React 19 + TypeScript**, **MySQL 8**, **Tailwind CSS v4**, **Zustand**, and **Docker**.

---

## Architecture Overview

```text
                                [ Client Browser ]
                                        │
                         HTTP Port 80 (or 5173 dev)
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │               Nginx Gateway             │
                   │           (Reverse Proxy / Web)         │
                   └────────────────────┬────────────────────┘
                                        │
                   ┌────────────────────┴────────────────────┐
                   ▼                                         ▼
        ┌─────────────────────┐                   ┌─────────────────────┐
        │  Vite React 19 SPA  │                   │  Laravel 13 PHP-FPM │
        │ (Tailwind CSS v4 &  │                   │  (REST API Sanctum  │
        │  Zustand Stores)    │                   │   Checkout Engine)  │
        └─────────────────────┘                   └──────────┬──────────┘
                                                             │
                              ┌──────────────────────────────┼──────────────────────────────┐
                              ▼                              ▼                              ▼
                   ┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────┐
                   │    MySQL 8 RDBMS    │        │     Redis Cache     │        │  Queue & Scheduler  │
                   │ (Pessimistic Lock & │        │  (Session & Queues) │        │ (Background Jobs &  │
                   │  Inventory Ledger)  │        └─────────────────────┘        │  Stock Expirations) │
                   └─────────────────────┘                                       └─────────────────────┘
```

---

## 1. Project Structure

```text
Phone Shop/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (Backend & Frontend tests)
├── backend/                     # Laravel 13 (PHP 8.3) REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   │   ├── Admin/       # RBAC Admin controllers (Products, Inventory, Orders, etc.)
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── CartController.php
│   │   │   │   ├── CheckoutController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── ...
│   │   │   ├── Middleware/RoleMiddleware.php
│   │   │   └── Requests/
│   │   ├── Models/              # Eloquent models (22 core domain models)
│   │   └── Services/
│   │       ├── CartService.php           # Guest & authenticated cart orchestration
│   │       ├── CheckoutService.php       # Transactional checkout & price snapshotting
│   │       ├── InventoryService.php      # Pessimistic locking (lockForUpdate) ledger
│   │       └── Payment/                  # Payment gateway abstraction (COD, ABA KHQR, Stripe)
│   ├── database/
│   │   ├── migrations/          # 12 schema migrations (26+ database tables)
│   │   └── seeders/             # Real seed data (20 flagship phones, 27 variants, admin, coupons)
│   ├── routes/api.php           # 57 versioned REST API endpoints under /api/v1
│   └── tests/Feature/           # PHPUnit/Pest automated feature tests
├── frontend/                    # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                 # Axios client with guest session & Sanctum auth interceptors
│   │   ├── components/          # Reusable UI components (Navbar, CartDrawer, ProductCard, etc.)
│   │   ├── layouts/             # CustomerLayout and dedicated AdminLayout
│   │   ├── pages/               # Storefront pages (Home, Products, Detail, Checkout, Tracking)
│   │   │   └── admin/           # Admin portal pages (Dashboard, Inventory, Orders, Customers)
│   │   ├── stores/              # Zustand state stores (auth, cart, wishlist, filters)
│   │   ├── types/               # TypeScript data models and API interfaces
│   │   └── __tests__/           # Vitest and React Testing Library tests
├── docker/
│   ├── nginx/default.conf       # Reverse proxy configuration
│   ├── php/Dockerfile           # PHP 8.3 FPM image with extensions
│   └── frontend/Dockerfile      # Node 20 Vite production / dev build
├── docs/
│   └── openapi.yaml             # Complete OpenAPI 3.0 API specification
├── docker-compose.yml           # Multi-container orchestration (App, Nginx, DB, Redis, Queue)
├── .env.example                 # Environment template
└── README.md
```

---

## 2. Default Local Development Credentials

| Account Role | Email Address | Default Password | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@example.com` | `ChangeMe123!` | Full administrative access to `/admin` portal. *(Please change upon production setup)* |
| **Demo Customer**| `customer@example.com` | `Password123!` | Standard customer account with order history and address book |

### Test Discount Coupons
* `WELCOME10`: 10% off entire order
* `PHONEHUB50`: $50 off orders over $500
* `FLAGSHIP100`: $100 off orders over $1,000

---

## 3. Quick Start with Docker (Recommended)

Run the entire application in containers without installing PHP, Node, MySQL, or Redis on your host machine:

### Step 1: Clone and Configure Environment
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### Step 2: Build and Start Containers
```bash
docker compose up -d --build
```

### Step 3: Run Database Migrations & Seeds
```bash
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan storage:link
```

### Step 4: Access Application
* **Storefront:** [http://localhost](http://localhost) (or port 80/5173 depending on config)
* **Admin Portal:** [http://localhost/admin](http://localhost/admin)
* **REST API:** [http://localhost/api/v1](http://localhost/api/v1)

---

## 4. Local Development Without Docker

If running directly on a machine with PHP 8.3 and Node.js 20 installed:

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve --port=8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173` with automatic API proxying to `http://127.0.0.1:8000`.

---

## 5. Running Automated Tests

### Backend Feature & Unit Tests (PHPUnit)
All tests verify Sanctum authentication, product filtering, guest cart merge, pessimistic inventory locks, coupon constraints, and admin RBAC:
```bash
cd backend
php artisan test
```
*Result: 18 passed tests, 68 assertions.*

### Frontend Tests (Vitest + React Testing Library)
Tests state stores, calculations, and component rendering:
```bash
cd frontend
npm run test
```
*Result: 3 test suites passed, 7 tests passed.*

---

## 6. API Documentation

An OpenAPI 3.0 specification is available at [`docs/openapi.yaml`](file:///c:/Users/Asus/Desktop/Phone%20Shop/docs/openapi.yaml).

### Key Endpoints:

#### Public Storefront
* `GET /api/v1/products` — Paginated catalog with faceted filters (search, brand, category, price range, sorting).
* `GET /api/v1/products/{slug}` — Single product with gallery, specifications, and variants.
* `GET /api/v1/categories` — Nested category hierarchy.
* `GET /api/v1/brands` — Smartphone brand registry.
* `GET /api/v1/orders/track/{orderNumber}` — Public order tracking timeline.

#### Shopping Cart
* `GET /api/v1/cart` — View active cart (uses guest header or Sanctum user).
* `POST /api/v1/cart/items` — Add product variant with stock verification.
* `PUT /api/v1/cart/items/{id}` — Update item quantity.
* `DELETE /api/v1/cart/items/{id}` — Remove item.
* `POST /api/v1/cart/coupon` — Apply discount coupon code.

#### Checkout & Customer (Sanctum Required)
* `POST /api/v1/checkout` — Multi-step transactional checkout. Snapshots prices, deducts inventory with pessimistic lock (`lockForUpdate`), records ledger, and triggers payment gateway.
* `GET /api/v1/orders` — Customer order history.
* `GET /api/v1/wishlist` — Saved wishlist items.
* `POST /api/v1/reviews` — Submit verified purchase product review.

#### Admin Portal (`role:admin,super_admin,manager`)
* `GET /api/v1/admin/dashboard/stats` — Revenue stats, category breakdown, 7-day order analytics.
* `apiResource /api/v1/admin/products` — Full CRUD for smartphones, specifications, variants.
* `GET /api/v1/admin/inventory` — Stock levels and low-stock alerts.
* `POST /api/v1/admin/inventory/adjust` — Manual stock adjustments with audit trail.
* `PUT /api/v1/admin/orders/{id}/status` — Status progression (Confirmed → Shipped → Delivered). Auto-restocks on cancellation.
* `GET /api/v1/admin/audit-logs` — Immutable administrative event log.

---

## 7. Key Architecture & Business Logic Implementations

### Concurrency-Safe Inventory Ledger
Inventory deductions occur in a database transaction with `lockForUpdate()`. When stock is depleted below the requested quantity, checkout aborts with HTTP 422, guaranteeing zero negative inventory. Every modification creates an `inventory_transactions` record for reconciliation.

### Guest-to-Account Cart Merge
When a visitor browses without logging in, their cart is persisted via an `X-Guest-Session-Id` header. Upon logging in or registering, `CartService::mergeGuestCart()` automatically migrates the guest items into the user's permanent account cart.

### Cambodian & International Address Hierarchy
The checkout supports Cambodian administrative subdivisions (Province, District, Commune, Village) as well as international street address formats. During checkout, the active address is snapshotted into `orders.shipping_address_snapshot` so future customer address edits never mutate historical orders.

### Payment Gateway Abstraction
Payment providers implement `PaymentGatewayInterface`:
* `CashOnDeliveryGateway`: Auto-confirms order with payment collected upon delivery.
* `BankTransferGateway`: Generates ABA KHQR payment instructions and reference codes.
* `StripeGateway`: Handles payment intents and signature-verified webhooks.

---

## 8. Production Deployment Guide

1. **Security Settings in `.env`:**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-domain.com
   SESSION_SECURE_COOKIE=true
   ```
2. **Optimize Laravel Backend:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
3. **Build Frontend Production Assets:**
   ```bash
   cd frontend
   npm run build
   ```
4. **Configure SSL / HTTPS:**
   Place valid SSL certificates in `docker/nginx/certs` and bind port 443 in `docker-compose.yml`.
5. **Supervisor / Queue Worker:**
   Ensure the background queue worker container is running:
   ```bash
   docker compose up -d queue scheduler
   ```

---

## 9. Non-Critical Limitations / Roadmap
* Direct integration with live Cambodian banking APIs (e.g., live Bakong KHQR Webhook) is stubbed with the ABA Bank Transfer QR simulator and ready for live merchant credentials.
* Elasticsearch/Meilisearch driver can be toggled via Laravel Scout for multi-million SKU catalogs.
