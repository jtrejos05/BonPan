# Bon Pan

Bon Pan is the web platform for **Bon Pan**, an artisan bakery in Ibagué, Colombia. It brings the whole order flow into one app: customers browse the menu and order online, the bakery's staff prepare orders from a point-of-sale screen, and the owners manage products, promotions, delivery zones and sales from an admin panel.

The frontend is a React single-page app deployed on **Vercel**, and the backend is a Node.js/Express REST API with PostgreSQL deployed on **Railway**.

---

## What the app does

The app has three modules. Each one has its own login and its own set of routes.

### 1. Customer storefront (`/`)

The public site for customers:

- **Home, story and contact pages.** The contact form sends email through EmailJS, and a floating WhatsApp button opens a chat with the bakery.
- **Menu (`/menu`).** Products are loaded from the API, each with an optional English description.
- **Cart and checkout (`/pedido`).** Customers choose **pickup** at a store or **home delivery**. The delivery fee depends on the customer's neighborhood (coverage zone).
- **Payments.** Customers can pay cash on delivery or online through **Wompi** (cards, PSE, Nequi and other methods). An order paid online only goes into preparation after Wompi approves the payment. Online payments that are never completed expire after 3 hours, and their orders are cancelled.
- **Customer accounts (`/register`, `/login`).** Customers sign up with email and password or with Google Sign-In. Registered customers get:
  - a **10% discount** on every order;
  - **loyalty points**: 1 point for every COP $1,000 spent, and every 100 points can be redeemed for COP $10,000 off.
- **Promo codes.** Admins create percentage or fixed-amount discount codes, and customers apply them at checkout.
- **Order tracking (`/seguimiento`).** Shows the live status of an order as it moves through *Pending → In preparation → Ready → Delivered*.

### 2. Admin panel (`/admin`)

For the bakery owners. You log in with the admin credentials set in the server's environment.

| Section | What it does |
|---|---|
| Dashboard | Sales metrics and charts (revenue per day, sales by category, orders by hour, top 5 products), with a date filter |
| Orders | View all orders, filter them, change their status and see their payment status |
| Products | Create, edit and hide products; images are uploaded to Cloudinary |
| Promotions | Create, enable or disable, and delete discount codes |
| Points of sale | Manage stores (address, opening hours, which store receives delivery orders), their employee accounts, and the log of employee login attempts |
| Zones | Manage delivery neighborhoods and their fees |
| Customers | Registered customers and their order history |
| Activity | Log of the actions taken in the customer and admin modules |

### 3. Point of sale (`/punto-venta`)

For the employees at each store. They log in with the username and password the admin created for them. Logins are rejected outside the store's opening hours, and sessions last 12 hours.

The dashboard shows the store's incoming orders, refreshes every 15 seconds and plays a sound when a new order arrives. Employees move orders through the preparation statuses from this screen.

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router 7, Tailwind CSS 4, Framer Motion, Recharts, Lucide icons |
| Backend | Node.js, Express 5, `pg` (PostgreSQL), JWT authentication, bcrypt |
| Integrations | Wompi (payments), Google OAuth (customer login), Cloudinary (product images), EmailJS (contact form) |
| Hosting | Vercel (frontend, plus Vercel Analytics and Speed Insights) and Railway (API and PostgreSQL) |

---

## Project structure

```
.
├── index.html, vite.config.js, vercel.json   # Frontend build and deploy config
├── public/                                   # Static images (logo, product photos)
├── src/                                      # React frontend
│   ├── App.jsx                               # Routes for the three modules
│   ├── pages/                                # Customer storefront pages
│   ├── admin/                                # Admin panel screens
│   ├── punto-venta/                          # Point-of-sale login and dashboard
│   ├── components/                           # Shared UI (Navbar, error screen)
│   ├── context/                              # Cart and auth state (AppContext, AuthContext)
│   └── services/                             # API client (api.js) and Wompi widget (wompi.js)
└── server/                                   # Express API
    ├── index.js                              # App entry point and automatic migrations
    ├── db.js                                 # PostgreSQL connection pool
    ├── routes/                               # One file per resource (see the API overview below)
    ├── middleware/                           # Auth for customers, admin and staff
    ├── utils/                                # Store opening hours, expiry of unpaid orders
    ├── schema.sql, schema_users.sql          # Base database schema
    └── migrations/                           # Additional SQL migrations
```

---

## Running it locally

### Requirements

- Node.js 20 or newer
- A PostgreSQL database

### 1. Database

Create a database (for example `bonpan`) and load the base schema:

```bash
psql -d bonpan -f server/schema.sql
psql -d bonpan -f server/schema_users.sql
psql -d bonpan -f server/migrations/add_puntos_usuarios.sql
```

You don't need to create the remaining tables by hand. Each time it starts, the server runs idempotent migrations that add the points-of-sale, employees, delivery-zone and payment tables and columns, and that seed Ibagué's default delivery neighborhoods.

### 2. Backend

```bash
cd server
npm install
cp .env.example .env    # then fill in the values (see below)
npm run dev             # starts on http://localhost:4000 with nodemon
```

Check that it's running at `http://localhost:4000/api/health`.

### 3. Frontend

From the project root:

```bash
npm install
npm run dev             # starts on http://localhost:5173
```

In development, the frontend calls `http://localhost:4000/api` automatically.

### Available scripts

| Where | Command | What it does |
|---|---|---|
| root | `npm run dev` | Start the Vite dev server |
| root | `npm run build` | Build the frontend into `dist/` |
| root | `npm run lint` | Run ESLint |
| `server/` | `npm run dev` | Start the API with auto-reload |
| `server/` | `npm start` | Start the API (production) |

---

## Environment variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Railway provides it automatically. When it is set, the connection uses SSL. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Used instead of `DATABASE_URL` when it isn't set. Use these for a local database without SSL. |
| `PORT` | API port (default `4000`) |
| `JWT_SECRET` | Secret for signing customer, admin and employee tokens |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin panel credentials |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID, used to verify Google sign-ins |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary account for product images |
| `WOMPI_API_URL` | `https://sandbox.wompi.co/v1` for testing, `https://production.wompi.co/v1` for real payments |
| `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET` | Wompi keys (see the next section) |

### Frontend (`.env` in the project root, optional)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL. If you leave it unset, the frontend uses `localhost:4000` in development and the Railway URL in production. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for the sign-in button |

---

## Online payments with Wompi

Checkout uses Wompi's [Web Checkout widget](https://docs.wompi.co/docs/colombia/widget-checkout-web/).

### Setup

1. Create a merchant account at [comercios.wompi.co](https://comercios.wompi.co) and copy your keys from **Developers**.
2. Add them to `server/.env`. Use the `pub_test_` and `test_` keys with the sandbox URL while testing. For production, switch to the `pub_prod_` and `prod_` keys and the production URL.
3. In the Wompi dashboard, set the **events URL** (webhook) to `https://<your-api>/api/pagos/webhook`.

### How it works

1. When a customer confirms an order with "Pay online", the backend (`POST /api/pagos/firma`) generates the payment reference and the integrity signature, and the frontend opens the Wompi widget. The integrity secret never reaches the browser.
2. Wompi reports the result to the webhook (`POST /api/pagos/webhook`), and the backend verifies the event checksum. The frontend also confirms the result through `GET /api/pagos/verificar/:transactionId`.
3. The payment status is saved on the order (`payment_status`, `payment_reference`, `wompi_transaction_id`, `payment_method`) and is shown in the admin panel and on the tracking page.

In sandbox mode you can test with card `4242 4242 4242 4242`, any future expiry date and any CVC.

---

## API overview

All endpoints live under `/api`. "Admin" means the endpoint needs the admin token, and "Staff" means it accepts either the admin token or a point-of-sale employee token.

| Resource | Endpoints |
|---|---|
| `/productos` | Public product list and detail; admin CRUD |
| `/pedidos` | Create an order (public), track it (`/:id/seguimiento`), list orders (admin), change status (staff) |
| `/pagos` | Wompi signature, webhook and verification |
| `/usuarios` | Register, log in, Google login, profile (`/me`), redeem points (`/me/canjear`) |
| `/auth` | Admin login |
| `/promociones` | Active promotions, validate a code, admin CRUD |
| `/puntos-venta` | Stores, employee management, access log (admin), employee login, a store's orders (employee) |
| `/zonas` | Delivery zones (public) and admin CRUD |
| `/clientes` | Customers and their orders (admin) |
| `/actividad` | Activity log |
| `/upload` | Upload or delete product images on Cloudinary (admin) |
| `/health` | Health check |

---

## Deployment

- **Frontend: Vercel.** `vercel.json` builds with `npm run build`, serves `dist/` and rewrites every route to `index.html` so React Router can handle deep links.
- **Backend: Railway.** It runs `server/` with `npm start`, using a Railway PostgreSQL database (`DATABASE_URL` is injected automatically). Set the remaining backend environment variables in the Railway service settings. Database migrations run automatically on every deploy.
