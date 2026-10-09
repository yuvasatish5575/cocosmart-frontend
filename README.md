# CocoSmart – Frontend

Customer-facing web app for **CocoSmart**, a full-stack e-commerce platform for coconut-based products.

**Tech:** React · TypeScript · Vite · Tailwind CSS · React Router · Radix UI · Framer Motion · Docker + Nginx

Backend API: [cocosmart-backend](https://github.com/yuvasatish5575/cocosmart-backend)

---

## Features

- **Shopping:** home page, shop with filters, product detail pages with image gallery
- **Recommendations:** "You may also like" carousels
  - product page shows other products from the **same category**
  - cart drawer shows **featured products** that are not already in the cart
- **Cart & checkout:** cart drawer, saved delivery addresses, order confirmation
- **Accounts:** register with **email verification (OTP)**, login with password or **one-time code**,
  forgot / reset password, profile, order history, wishlist, subscriptions
- **Coco – help assistant:** chat widget that answers common questions
  (orders, delivery, choosing a product) from a **keyword-matched FAQ knowledge base**
- **Extra pages:** product traceability, wholesale enquiries, about
- **Admin area:** dashboard, product management, order management (admin role only)
- Responsive design with reusable UI components

## Project structure

```
src/
  pages/        one file per route (Shop, ProductDetail, Checkout, Orders, admin/ …)
  components/   reusable UI components
  services/     API calls to the backend
  hooks/        shared React hooks (cart, auth …)
  data/         static content (assistant FAQ, Indian states …)
  lib/, styles/ helpers and global styles
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Start the [backend](https://github.com/yuvasatish5575/cocosmart-backend) first. In development, Vite proxies
`/api` to `http://localhost:4000`, so no extra configuration is needed. To point at a deployed API,
set `VITE_API_URL` in `.env` (see `.env.example`).

Production build: `npm run build`. A `Dockerfile` + `nginx.conf` are included to serve the built app.
