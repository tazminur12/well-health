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
10. Admin Customers page — table + customer detail drawer

**Next up:**
- Admin Chat Inbox (design)
- Customer Dashboard layout + pages (design)
- Dedicated Shop page with filters, Product Detail page, Cart page (design)
- Chat Widget — customer-facing (design)
- Backend integration phase (Prisma schema, Supabase Auth, Cloudinary uploads, SSLCommerz payment, Supabase Realtime chat)
- Bilingual (EN/BN) toggle, SEO, deployment

---

## Implementation Notes

- Every Server Action validates input with `zod` before touching Prisma
- Admin routes double-check `role === 'ADMIN'` server-side — never trust the client
- Prices stored as `Decimal`, displayed as `৳ X,XXX.XX` via a shared `formatPrice()` util
- Order numbers formatted as `WHT-2026-00001`
- `src/lib/cloudinary.ts` is the single abstraction point for all Cloudinary calls — same pattern as the `src/lib/sms.ts` abstraction used in QuoteFlow
- Status pill badge colors stay consistent across Dashboard, Orders, and Customers pages: PENDING (amber), PAID (blue), PROCESSING (purple), SHIPPED (indigo), DELIVERED (green), CANCELLED (red)