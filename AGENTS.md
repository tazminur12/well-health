# AGENT.md — Well Health Trade International

## Project Overview

E-commerce platform for a health supplement brand. Three portals in a single Next.js codebase using route groups: **Public Marketing Site**, **Customer Dashboard**, **Admin Panel**. Includes live chat support, Cloudinary-powered product imagery, and Bangladesh-market payment gateways.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components + Server Actions) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Image CDN | Cloudinary (signed uploads) |
| Payment | SSLCommerz (primary), bKash (secondary) |
| Email | Resend |
| Realtime Chat | Supabase Realtime (broadcast channels) |
| State | Zustand (cart), TanStack React Query (server cache) |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts (admin analytics) |
| Deployment | Vercel (frontend) + Supabase (hosted DB) |

---

## Design System — "Clinical Premium"

Brand personality: trustworthy, clean, pharmaceutical-grade, nature-backed. This is a health brand — credibility takes priority over visual excitement.

**Color Palette**
- Primary dark `#0B4D3A` — header, footer, sidebar
- Primary `#16875D` — buttons, links, accents
- Soft background `#E8F5EE` — badges, light sections
- Gold accent `#C9A24B` — premium highlights, used sparingly
- Text `#1A1D1F` / Muted text `#6B7280`
- Page background `#F7F8F9`
- Error `#DC2626` / Success `#16875D`

**Typography**
- Headings: Sora
- Body: Inter
- Bangla: Hind Siliguri

**Principles**
1. Generous white space, never cramped
2. Soft shadows, rounded-xl to rounded-2xl corners, no harsh edges
3. Product photography on soft gradient/wood-tone backgrounds
4. Trust signals everywhere — certifications, doctor-recommended tags, lab-tested icons
5. Smooth 200ms micro-interactions
6. Icons: lucide-react, thin-stroke, consistent weight

---

## Development Approach

**Design-first workflow.** All UI is built with dummy/placeholder data before any backend integration. This lets the full visual system get reviewed and refined early, and keeps each Cursor prompt focused on one concern at a time.

**Phase order:**
1. Foundation (project setup, theme, folder structure)
2. Public site design (navbar, hero, about, products, shop, contact)
3. Admin panel design (dashboard, products, orders, customers, chat)
4. Customer dashboard design
5. Backend integration (Prisma schema, Supabase Auth, Cloudinary, payment, realtime chat)
6. Polish (bilingual toggle, SEO, deployment)

---

## Folder Structure

```
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (customer)/
│   ├── (admin)/
│   └── api/
├── components/
│   ├── ui/
│   ├── public/
│   ├── customer/
│   ├── admin/
│   └── chat/
├── lib/
│   ├── prisma.ts
│   ├── supabase/
│   ├── cloudinary.ts
│   └── payment/
├── store/
└── types/
```

---

## Data Model (introduced at backend phase)

Core entities: `User` (Role: CUSTOMER / ADMIN / SUPPORT), `Category`, `Product`, `ProductImage`, `Cart`, `CartItem`, `Order` (OrderStatus: PENDING → PAID → PROCESSING → SHIPPED → DELIVERED / CANCELLED), `OrderItem`, `Address`, `Review`, `Wishlist`, `ChatConversation`, `ChatMessage`.

---

## Progress Log

**Completed (Design Phase):**
1. Foundation setup — theme, fonts, folder scaffolding
2. Public layout — TopBar, Navbar, Footer
3. Home hero + trust badges
4. About Us + Featured Products section
5. Shop preview section (category tabs + list view)
6. Contact section (info cards + map + form)
7. Admin layout — sidebar + topbar + dashboard overview
8. Admin Products page — table + Add/Edit drawer
9. Admin Orders page — table + order detail drawer
10. Admin Customers — list + full-page Add / Details / Edit (CRM backend)
11. Customer Dashboard layout + overview page (mobile-first: bottom tabs, slide-in drawer, desktop sidebar)
12. Customer Profile page (summary card, accordion sections, address/password modals, danger zone)
13. Customer Orders — list page (filter tabs, search, order cards, load more) + order detail page (vertical timeline, items, payment, contextual actions)
14. Customer Wishlist page (2/3/4-col grid, always-filled heart w/ remove animation, out-of-stock state, sort toolbar, sticky bulk-add bar, undo snackbar)
15. Auth UI — login/register pages (premium auth layout, form validation, password strength)
16. Forgot / Reset password pages + Supabase email recovery callback (`/auth/callback`)
17. Admin Product Management redesign — full-page Add/Edit product form, list CRUD (filters, pagination, bulk archive/delete, live stats)

**Completed (Backend — Auth):**
1. Supabase Auth login / register / logout server actions (`src/lib/auth/actions.ts`)
2. Zod validation schemas + Prisma `User` model sync on auth
3. Middleware session refresh + protected customer/admin routes + auth-page redirects
4. Login/register UI wired to backend; logout wired in customer shell
5. Password reset flow (`forgotPasswordAction`, `resetPasswordAction`) + `users` table synced

**Completed (Backend — Products):**
1. Prisma models: `Category`, `Product`, `ProductImage` (+ offer fields, enums)
2. Admin-gated product server actions (CRUD, bulk delete/archive, featured/status)
3. Zod validation + DTO mapper; seed script (`npm run db:seed`)
4. Admin UI wired via TanStack Query to live DB
5. Local product image uploads (`public/uploads/products`) + Server Actions body limit 32mb
6. Public storefront wired to Active products — Shop, PDP, Featured, Shop preview, Cart (Zustand)

**Completed (Backend — Customers):**
1. Prisma `User` CRM fields: `status` (ACTIVE/SUSPENDED), `notes`, `isVip`
2. Admin customer actions: list/get/create/update/suspend/delete via Supabase Admin API + Prisma
3. Full-page UI: list, `/admin/customers/new`, `/admin/customers/[id]`, `/admin/customers/[id]/edit` (drawer removed)

**Completed (Backend — Role Management):**
1. Prisma `StaffRole` + `StaffInvite` models; User.staffRoleId
2. Create custom roles (Admin/Support access), create staff accounts, Resend email invites
3. Accept invite page `/invite/[token]`; admin UI `/admin/roles`
4. Role details `/admin/roles/[id]` — toggle module permissions (dashboard, products, orders, customers, roles, blog, content, settings); Super Admin locked full access; Customer has no admin modules

**Completed (Backend — Admin Profile):**
1. `/admin/profile` — personal details, avatar upload, password change, sign out
2. Server actions sync Prisma + Supabase metadata; shell topbar/sidebar show live admin name/avatar

**Completed (Backend — Blog):**
1. Prisma `BlogPost` model (status Draft/Published/Scheduled/Archived, categories, SEO, featured image, views, author)
2. Admin CRUD actions + featured image upload (`public/uploads/blog`) + React Query hooks
3. Premium admin UI: live stats, filters, bulk delete, featured toggle, markdown editor toolbar, SEO search preview
4. Public storefront `/blog` + `/blog/[slug]` (category filters, reading time, admin draft preview via `?preview=1`)
5. Navbar + footer Blog links

**Completed (Backend — Content Management):**
1. Prisma models: `HeroSlide`, `TrustBadge`, `FaqItem`, `SiteSetting` (about_home + site_assets)
2. Admin `/admin/content` tabs wired: Hero, Trust Badges, About, FAQ, Site Assets — CRUD + image uploads
3. Homepage consumes live CMS content (with sensible fallbacks)
4. Seed defaults for hero/trust/FAQ/about

**Completed (Backend — Store Settings):**
1. `SiteSetting` key `store_settings` — store name, contact, social, shipping defaults, SEO, maintenance flag
2. Admin `/admin/settings` — tabbed UI (General, Contact, Social, Orders, SEO) + Zod-validated server actions
3. Public TopBar, Footer, Contact section/page, Map card consume live settings (with defaults)

**Completed (Backend — Admin Notifications):**
1. Prisma `AdminNotification` model (ORDER / PRODUCT / CUSTOMER / SYSTEM / BLOG)
2. Admin `/admin/notifications` — filters, mark read, mark all, delete
3. Topbar bell dropdown — unread badge, preview list, mark all, link to full page

**Completed (Admin — API Health):**
1. Sidebar + `/admin/api-health` — live checks for App, Postgres, Supabase Auth, Cloudinary, Resend, SSLCommerz, bKash
2. Premium status dashboard with overall health, latency, and category groups

**Completed (Backend — Categories):**
1. Category `isActive` field; admin CRUD + reorder + activate/deactivate
2. Premium `/admin/categories` — gradient cards, stats, search/filters, slide-over editor
3. Sidebar + role permission `categories`

**Completed (Backend — Inventory):**
1. Admin `/admin/inventory` — live stock table, filters, +/- adjust, edit stock/threshold
2. Server actions for list/update/adjust; Catalog sidebar group + permission `inventory`

**Completed (Backend — Coupons):**
1. Prisma `Coupon` model (percent/fixed, limits, schedule, usage tracking)
2. Premium `/admin/coupons` — cards, filters, create/edit drawer, enable/disable
3. Sales sidebar + permission `coupons`; seed sample promos

**Completed (Backend — Reviews):**
1. Prisma `ProductReview` (PENDING/APPROVED/REJECTED, featured, admin reply)
2. Premium `/admin/reviews` — moderation queue, approve/reject, feature, reply, delete
3. Catalog sidebar + permission `reviews`; seed sample reviews

**Completed (Backend — Shipping):**
1. Prisma `ShippingZone` + `ShippingCourier` for Bangladesh delivery
2. Premium `/admin/shipping` — zones (fees, ETA, COD), couriers, store free-shipping summary
3. Sales sidebar + permission `shipping`; seed Dhaka / Outside Dhaka zones + partners

**Completed (Design — Reports / Analytics):**
1. Premium `/admin/reports` — KPI cards, range filters, revenue trend, order status, category/payment mix, regions, top products (dummy data + Recharts)
2. Overview sidebar + permission `reports`

**Completed (Backend — Marketing Campaigns):**
1. Prisma `MarketingCampaign` (EMAIL / SMS, audiences, draft → send)
2. Premium `/admin/marketing` — Email + SMS tabs, compose drawer, audience targeting, campaign cards
3. Resend email sends (preview mode if key missing); SMS via `src/lib/sms.ts` stub until `SMS_*` env vars are added
4. Marketing sidebar (Campaigns) + permission `marketing`

**Completed (Backend — Messages / Chat Inbox):**
1. Prisma `ContactMessage` linked to Contact page + homepage contact form submissions
2. Premium `/admin/messages` split inbox — filters, thread list, chat-style detail, notes, archive, mailto reply
3. Creates admin notification on new inquiry; sidebar unread badge; permission `messages`

**Completed (Backend — Customer Profile):**
1. Prisma `Address` model + User profile fields (`dateOfBirth`, `gender`, `preferences`)
2. Server actions: update profile, password, avatar, addresses CRUD, preferences, delete account
3. `/profile` wired via TanStack Query; modals use portals (fix stacked/non-closing bug)
4. Logout + live avatar upload; language & notification prefs persisted

**Completed (Backend — Orders Management):**
1. Admin orders CRUD actions: list, stats, get, update status/payment/notes, manual create (stock + coupon)
2. Premium `/admin/orders` — live KPIs, filters, CSV export, status tabs
3. Full-page detail `/admin/orders/[id]` — timeline, fulfill, payment, notes; cancel restores stock
4. Manual `/admin/orders/new` — customer search, products, shipping zones, payment/status
5. Dashboard recent orders wired to live data; permission `orders`

**Completed (Backend — Payments):**
1. SiteSetting `payment_settings` — enable COD / SSLCommerz / bKash + checkout instructions
2. Premium `/admin/payments` — collected/unpaid KPIs, gateway cards, COD collection queue
3. Syncs COD flag with store settings; Sales sidebar + permission `payments`

**Completed (Backend — Customer Orders):**
1. Customer order actions: list/get/cancel/stats (ownership by userId or email)
2. Premium `/orders` + `/orders/[orderNumber]` — live data, filters, invoice PDF, reorder, cancel
3. Dashboard stats + recent orders + wishlist preview wired to live data
4. Guest checkout orders auto-linked when customer signs in with same email

**Next up:**
- Chat Widget — live realtime (backend)
- Payment gateways (SSLCommerz / bKash callbacks)
- Remaining backend (Cloudinary CDN, Realtime chat)
- Bilingual (EN/BN) toggle, SEO, deployment

---

## Implementation Notes

- Every Server Action validates input with `zod` before touching Prisma
- Admin routes double-check `role === 'ADMIN'` server-side — never trust the client
- Prices stored as `Decimal`, displayed as `৳ X,XXX.XX` via a shared `formatPrice()` util
- Order numbers formatted as `WHT-2026-00001`
- `src/lib/cloudinary.ts` is the single abstraction point for all Cloudinary calls — same pattern as the `src/lib/sms.ts` abstraction used in QuoteFlow
- Status pill badge colors stay consistent across Dashboard, Orders, and Customers pages: PENDING (amber), PAID (blue), PROCESSING (purple), SHIPPED (indigo), DELIVERED (green), CANCELLED (red)