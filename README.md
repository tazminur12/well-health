# Well Health Trade International

E-commerce platform for a Bangladesh-focused health supplement brand. One Next.js codebase powers three experiences: a public marketing storefront, a customer dashboard, and a full admin panel — with Cloudinary media, Supabase Auth, Bangladesh shipping (Steadfast), and local payment options (COD, SSLCommerz, bKash).

---

## Overview

| Portal | Audience | Purpose |
|---|---|---|
| **Public site** | Visitors & shoppers | Marketing, shop, cart, checkout, blog, contact |
| **Customer dashboard** | Registered buyers | Orders, profile, wishlist, account settings |
| **Admin panel** | Staff & super admins | Catalog, CRM, orders, CMS, marketing, logistics |

Brand direction: **Clinical Premium** — trustworthy, clean, pharmaceutical-grade. Credibility over visual noise.

---

## Features

### Public storefront
- Homepage CMS (hero slides, trust badges, about, FAQ, site assets)
- Shop, product detail pages, featured products, cart (Zustand)
- Checkout with shipping zones & payment method settings
- Blog listing + article pages (with admin draft preview)
- Contact form → admin inbox + notifications
- Wishlist, distributor inquiry, chatbot Q&A (EN + BN keywords)
- Live store settings (contact, social, SEO, maintenance flag)

### Customer dashboard
- Overview with order stats & recent activity
- Order list & detail (timeline, invoice PDF, reorder, cancel)
- Profile, addresses, avatar, password, preferences
- Guest orders auto-linked on sign-in with the same email

### Admin panel
- **Catalog** — products, categories, inventory, reviews, units
- **Sales** — orders (list, detail, manual create, CSV), coupons, shipping, payments, Steadfast courier
- **Customers** — CRM (VIP, notes, suspend), distributors
- **Content** — homepage CMS, blog, site settings
- **Marketing** — email/SMS campaigns (Resend + SMS stub)
- **Support** — contact inbox, chatbot training & unanswered queue
- **Team** — custom staff roles & module permissions, invites via Resend
- **Ops** — notifications, reports/analytics, API health checks, admin profile

### Platform
- Supabase Auth (email/password; Google OAuth ready)
- Role-based access (CUSTOMER / ADMIN / SUPPORT + custom `StaffRole` modules)
- Cloudinary signed uploads for products, blog, avatars, CMS
- Zod-validated Server Actions; admin checks on the server
- Rate limiting (Upstash Redis, optional in production)
- Order numbers: `WHT-YYYY-#####` · Prices: `৳ X,XXX.XX`

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components + Server Actions) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | Supabase Auth |
| Images | Cloudinary |
| Payments | COD · SSLCommerz · bKash (settings wired; gateway callbacks in progress) |
| Courier | Steadfast (Packzy API) |
| Email | Resend |
| State / cache | Zustand (cart), TanStack React Query |
| UI | Tailwind CSS + shadcn/ui · lucide-react · Recharts |
| Validation | Zod |
| Deploy target | Vercel + Supabase |

---

## Design system

**Palette**

| Token | Hex | Use |
|---|---|---|
| Primary dark | `#0B4D3A` | Header, footer, sidebar |
| Primary | `#16875D` | Buttons, links, accents |
| Soft green | `#E8F5EE` | Badges, light sections |
| Gold | `#C9A24B` | Premium highlights (sparingly) |
| Text / muted | `#1A1D1F` / `#6B7280` | Body copy |
| Page bg | `#F7F8F9` | Surfaces |
| Error / success | `#DC2626` / `#16875D` | Feedback |

**Typography:** Sora (headings) · Inter (body) · Hind Siliguri (Bangla)

**Order status colors:** PENDING (amber) · PAID (blue) · PROCESSING (purple) · SHIPPED (indigo) · DELIVERED (green) · CANCELLED (red)

---

## Project structure

```
src/
├── app/
│   ├── (public)/          # Marketing site, shop, cart, checkout, blog
│   ├── (auth)/            # Login, register, password reset, invites
│   ├── (customer)/        # Dashboard, orders, profile
│   ├── (admin)/           # Full admin panel
│   └── api/               # Route handlers (health, callbacks, etc.)
├── components/
│   ├── ui/                # Shared primitives
│   ├── public/            # Storefront UI
│   ├── customer/          # Customer shell & pages
│   ├── admin/             # Admin shell & pages
│   └── chat/              # Chat widget
├── lib/
│   ├── prisma.ts
│   ├── supabase/
│   ├── auth/
│   ├── cloudinary.ts
│   ├── payment/
│   ├── steadfast/
│   └── sms.ts
├── store/                 # Zustand (cart, etc.)
└── types/
prisma/
├── schema.prisma
└── seed.ts
```

---

## Getting started

### Prerequisites

- Node.js 20+
- npm (or pnpm / yarn)
- A Supabase project (PostgreSQL + Auth)
- Cloudinary account (for image uploads)
- Resend account (for transactional / invite / campaign email)

### 1. Clone & install

```bash
git clone <repository-url>
cd well-heath
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in values (see [Environment variables](#environment-variables)). Never commit `.env`.

### 3. Database

```bash
npm run db:push      # Sync Prisma schema to Postgres
npm run db:seed      # Seed categories, products, CMS, sample data
```

Optional: `npm run db:studio` to browse data in Prisma Studio.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Area | URL |
|---|---|
| Storefront | `/` |
| Login | `/login` |
| Customer dashboard | `/dashboard` |
| Admin | `/admin` |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js development server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio |

---

## Environment variables

Copy from `.env.example`. Required for local development:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | App base URL |
| `NEXT_PUBLIC_APP_NAME` | Display name |
| `DATABASE_URL` / `DIRECT_URL` | Prisma → Supabase Postgres |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin API |
| `CLOUDINARY_*` / `NEXT_PUBLIC_CLOUDINARY_*` | Image CDN & uploads |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email |
| `ADMIN_EMAIL` | Primary admin contact |

**Optional / integrations**

| Variable | Purpose |
|---|---|
| `STEADFAST_API_KEY` / `STEADFAST_SECRET_KEY` | Packzy courier API |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Distributed rate limiting |
| `CRON_SECRET` / `ORDER_ACCESS_SECRET` | Cron & signed guest order links |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console |

Payment gateway keys (SSLCommerz / bKash) are configured as product progresses; COD is controlled via admin payment settings.

---

## Architecture notes

- **Server Actions first** — mutations go through Zod-validated actions; Prisma is never called with untrusted client input.
- **Admin authorization** — routes and actions verify staff role / module permissions on the server; the client is never trusted.
- **Images** — `src/lib/cloudinary.ts` is the single upload abstraction; the DB stores CDN URLs.
- **Cart** — client-side Zustand for guest browsing; orders persist in Postgres at checkout.
- **Courier** — Steadfast client in `src/lib/steadfast/`; consignments sync from order detail and `/admin/steadfast`.
- **Chatbot** — keyword/alias matcher over `ChatbotQa`; unmatched queries land in `ChatbotUnanswered` for training.
- **Middleware** — refreshes Supabase session; protects customer/admin routes; redirects authenticated users away from auth pages.

---

## Core data model

Key entities include:

`User` (roles + CRM fields) · `StaffRole` / `StaffInvite` · `Category` · `Product` / `ProductImage` · `Order` / `OrderItem` · `Address` · `Coupon` · `ProductReview` · `ShippingZone` / `ShippingCourier` · `BlogPost` · CMS (`HeroSlide`, `TrustBadge`, `FaqItem`, `SiteSetting`) · `ContactMessage` · `MarketingCampaign` · `AdminNotification` · `ChatbotQa` / `ChatbotUnanswered`

**Order lifecycle:** `PENDING` → `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED` (or `CANCELLED`; cancel restores stock).

---

## Roadmap

- [ ] Live human chat agent (Supabase Realtime)
- [ ] SSLCommerz / bKash payment callbacks & verification
- [ ] Full EN/BN bilingual toggle
- [ ] SEO polish & production deployment hardening

---

## License

Private project — **Well Health Trade International**. All rights reserved.
