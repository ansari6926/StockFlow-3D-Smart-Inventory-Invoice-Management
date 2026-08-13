# StockFlow 3D — Tactive Assessment Presentation Deck

---

## Slide 1: Title & Vision
### StockFlow 3D — Smart Inventory & Atomic Invoicing
**Presenter**: Lead AI Software Engineer  
**Target**: Tactive Internship Hiring Assessment Review Committee  

> *"Guaranteeing financial and inventory integrity in modern e-commerce using atomic database transactions and AI-driven change workflows."*

---

## Slide 2: The Core Problem & Solution

### The Problem
- E-commerce platforms frequently experience **overselling** under high concurrent traffic.
- Client-side cart applications can be tampered with (price manipulation, quantity overflow).
- Partial mutations cause database corruption when network errors occur mid-checkout.

### Our Solution
- **PostgreSQL Row-Level Locking (`FOR UPDATE`)**: Prevents concurrent race conditions.
- **Trusted Server-Side Pricing**: Prices fetched exclusively from PostgreSQL during RPC transaction.
- **Zero Partial State**: Whole-transaction commit or rollback.

---

## Slide 3: System Architecture Highlights

```
React 19 Client ➔ Next.js 16 Server Actions ➔ Supabase Admin (Service Role) ➔ PostgreSQL Atomic RPC
```
- **Next.js 16 App Router**: Server Components, Server Actions, Dynamic rendering.
- **Supabase SSR + Admin Client**: Row-level security for regular reads, elevated service role strictly for atomic stored procedures.
- **Zod v3 Validation**: Shared schemas for client forms and server endpoints.

---

## Slide 4: Verification & Testing Rigor

- **31 Unit Tests**: 100% passing test suite for financial logic (`calculateInvoiceTotals`), edge case discounts, and Zod input boundaries.
- **Playwright E2E Tests**: Full automated browser flows covering authentication, cart manipulation, oversell prevention, and cancellation.
- **Deliberate RED/FAIL Evidence**: Verified that test suite actively catches regressions when business logic is intentionally corrupted.
- **AI Change Loop**: Successfully expanded functionality (Invoice Cancellation with automatic stock restoration) via an automated prompt-driven iteration cycle.

---

## Slide 5: Key Takeaways & Live Demo
- Production-ready codebase with clean architecture and 0 build errors.
- Fully documented deployment, API endpoints, schema, and user flows.
- Ready for live evaluation.
