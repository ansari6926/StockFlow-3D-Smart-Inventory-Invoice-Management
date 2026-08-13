# StockFlow 3D — Smart Inventory & Invoice Management System

![StockFlow 3D](https://img.shields.io/badge/Next.js-16.3.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Vitest-31%20Passed-green?logo=vitest)
![Build](https://img.shields.io/badge/Build-Clean%20Pass-brightgreen)

> **Official Tactive Internship Hiring Assessment Submission**  
> **Repository**: [StockFlow-3D-Smart-Inventory-Invoice-Management](https://github.com/ansari6926/StockFlow-3D-Smart-Inventory-Invoice-Management)  
> **Deployment**: [https://luxpmecozsggeootwcwq.supabase.co](https://luxpmecozsggeootwcwq.supabase.co)

---

## 🚀 Key Features & Highlights

1. **Zero Overselling (Atomic Transactions)**: PostgreSQL `create_invoice()` procedure uses `FOR UPDATE` row locking to guarantee stock is deducted atomically. Zero overselling under race conditions.
2. **Server-Side Financial Integrity**: Unit prices are fetched exclusively from the PostgreSQL database on the server. Client-submitted unit prices are ignored.
3. **Smart Inventory Catalog**: Full CRUD for products with live search, SKU uniqueness validation, category filtering, and automated low-stock warnings.
4. **Invoice Cancellation & Stock Restoration**: Cancel any `PAID` invoice with automatic, idempotent stock restoration.
5. **Modern Cyberpunk/Glassmorphic Aesthetics**: Built with Tailwind CSS v4, dynamic HSL dark mode, smooth 3D micro-animations, and Inter/Space Grotesk typography.
6. **Comprehensive Automated Test Suite**: 31 Vitest unit tests covering financial formulas, discount bounds, and Zod input validation, plus Playwright E2E browser tests.

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js `v18.17.0` or higher
- `npm` v9+

### 1. Clone & Install
```bash
git clone https://github.com/ansari6926/StockFlow-3D-Smart-Inventory-Invoice-Management.git
cd StockFlow-3D-Smart-Inventory-Invoice-Management
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Ensure your `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://luxpmecozsggeootwcwq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

### Run Unit Tests (Vitest)
```bash
npm run test:unit
```
*Executes 31 unit tests covering invoice calculations, tax formulas, discount bounds, and Zod input schemas.*

### Run Type Checking
```bash
npm run typecheck
```
*Validates static type safety across all server actions, components, and API routes.*

### Build Production Bundle
```bash
npm run build
```
*Compiles the Next.js production app and verifies dynamic routes.*

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Operator** | `demo@stockflow.app` | `StockFlow2024!` |

---

## 📑 Assessment Documentation Directory

All assessment requirement documents are stored in the [`docs/`](./docs/) directory:
- 🏗️ [Architecture Documentation](./docs/ARCHITECTURE.md)
- 🎨 [Design Documentation](./docs/DESIGN.md)
- 📖 [User Guide](./docs/USER_GUIDE.md)
- 📊 [Presentation Deck](./docs/PRESENTATION_DECK.md)
- ⏱️ [5-Minute Demo Plan](./docs/FIVE_MINUTE_DEMO_PLAN.md)
- 🔴 [Deliberate RED/FAIL Test Evidence](./docs/DELIBERATE_RED_FAIL_RUN.md)
- 🔄 [AI Change Loop Evidence](./docs/AI_CHANGE_LOOP_EVIDENCE.md)

---

## 🏛️ Database Architecture

### SQL Schema & RPC Functions
The database schema (`supabase/schema.sql`) defines:
- `products`: Product catalog with SKU index and stock quantity constraint.
- `invoices`: Invoice header records with financial totals and status check.
- `invoice_items`: Line item breakdown.
- `create_invoice()`: Atomic procedure that locks product rows with `FOR UPDATE`, checks stock, deducts stock, and creates invoice line items.
- `cancel_invoice()`: Atomic procedure that locks invoice/product rows, updates status to `CANCELLED`, and restores stock quantities.
