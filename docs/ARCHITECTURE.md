# StockFlow 3D — System Architecture & Design Specification

## 1. Executive Summary

**StockFlow 3D** is a production-grade SaaS application designed to eliminate overselling and inventory inconsistencies in high-concurrency retail and warehousing environments. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase, and PostgreSQL, the platform enforces strict **server-side financial and stock integrity** using atomic database transactions.

---

## 2. Architecture Overview

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              CLIENT TIER                               │
 │   Next.js React 19 Client Components (Interactive UI, Zod Pre-Check)   │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Server Actions & REST API
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              SERVER TIER                               │
 │     Next.js Server Actions & Middleware (Session & Auth Guards)        │
 │     Server-side Zod Input Schema Validation & Calculations             │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Supabase Admin Client (Service Role)
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                             DATABASE TIER                              │
 │   Supabase PostgreSQL Engine (Row-Level Locking, Atomic RPC Proc)     │
 │  - create_invoice() [FOR UPDATE lock, stock deduction, line items]      │
 │  - cancel_invoice() [FOR UPDATE lock, stock restoration, status check] │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Principles & Security Design

### 3.1 Server-Side Price & Financial Source of Truth
Client applications are inherently untrusted. StockFlow 3D ignores any unit prices submitted by the browser. When an invoice creation request is dispatched:
1. The server reads product IDs and requested quantities.
2. The PostgreSQL RPC function fetches current unit prices directly from `public.products` inside an active transaction block.
3. Financial totals (`subtotal`, `discount`, `tax`, `total`) are calculated on the database engine.

### 3.2 Atomic Concurrency Control (Zero Overselling)
To prevent race conditions where two simultaneous orders attempt to buy the last unit of stock:
- The `create_invoice()` PostgreSQL function executes `SELECT stock_quantity FROM products WHERE id = p_item.product_id FOR UPDATE;`.
- The row lock isolates the row until the transaction commits or rolls back.
- If `stock_quantity < requested_quantity`, an exception (`INSUFFICIENT_STOCK`) is raised, terminating the transaction instantly with zero partial mutations.

### 3.3 Strict Layer Separation
- **Presentation Layer**: React 19 client components managing transient state (cart items, draft discount, active filters).
- **Application Layer**: Next.js Server Actions (`lib/actions/*`) handling request parsing, authentication checks, cache revalidation, and error mapping.
- **Data Access Layer**: Supabase SSR client for authenticated user context; Supabase Admin Client (`supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`) restricted strictly to server actions calling atomic RPC procedures.

---

## 4. Database Schema Specification

### 4.1 Tables
- **`products`**: Catalog of items. Columns: `id` (UUID PK), `sku` (VARCHAR, UNIQUE), `name`, `description`, `category`, `price` (NUMERIC 10,2), `stock_quantity` (INTEGER), `reorder_threshold` (INTEGER), `created_at`, `updated_at`.
- **`invoices`**: Financial header record. Columns: `id` (UUID PK), `invoice_number` (VARCHAR, UNIQUE), `customer_name`, `subtotal`, `discount`, `tax`, `total`, `status` (`PAID` | `CANCELLED`), `notes`, `created_at`, `created_by`.
- **`invoice_items`**: Financial detail records. Columns: `id` (UUID PK), `invoice_id` (FK), `product_id` (FK), `quantity` (INTEGER > 0), `unit_price` (NUMERIC 10,2), `line_total` (NUMERIC 10,2).

### 4.2 Stored Atomic Procedures
- `create_invoice(...)`: Takes customer details, product array, discount percentage, tax percentage. Locks product rows, verifies stock, deducts stock, inserts invoice header & line items, returns invoice ID, number, and total.
- `cancel_invoice(...)`: Takes `invoice_id`. Locks invoice row, verifies status is `PAID`, marks as `CANCELLED`, iterates line items, locks product rows, restores stock quantities, returns status confirmation.

---

## 5. Technology Stack Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 App Router | Server Components for speed, Server Actions for seamless mutations, built-in API routing |
| **Language** | TypeScript 5 | End-to-end static type safety preventing runtime null/undefined errors |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with dark theme variable tokens, dynamic glassmorphism, responsive design |
| **Database & Auth**| Supabase (PostgreSQL 15) | Relational integrity, server-side RPC stored procedures, row locking, managed Auth |
| **Validation** | Zod v3 | Schema declaration for runtime boundary validation on both server actions & API endpoints |
| **Testing** | Vitest & Playwright | Vitest for ultra-fast unit testing; Playwright for full end-to-end browser automation |

---

## 6. Verification & Quality Assurance Strategy

1. **Unit Testing**: Covers financial calculation functions (`calculateInvoiceTotals`), Zod validation boundary checks (`ProductSchema`, `CreateInvoiceSchema`, `LoginSchema`).
2. **E2E Automation**: End-to-end browser tests verifying user authentication, normal path invoice creation, boundary validation errors, and invoice cancellation stock restoration.
3. **Red/Fail Verification**: Deliberate introduction of broken business logic to prove test suite catches failures before release.
