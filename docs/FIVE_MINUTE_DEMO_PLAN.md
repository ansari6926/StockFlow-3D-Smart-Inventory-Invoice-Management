# StockFlow 3D — 5-Minute Live Demo Plan

## Executive Overview (30 Seconds)
- **Goal**: Demonstrate atomic invoice creation, stock deduction, oversell prevention, and invoice cancellation in 5 minutes.
- **Environment**: Next.js 16 live application connected to Supabase PostgreSQL.

---

## Step-by-Step Agenda

### Minute 1: Landing Page & Authentication (0:00 - 1:00)
1. Open Landing Page (`/`). Point out visual design, stats, and 6-step atomic invoice architecture.
2. Click **"Sign In"**. Click **"Fill demo credentials"** (`demo@stockflow.app` / `StockFlow2024!`).
3. Click **"Sign In"** button. Observe seamless redirection to `/dashboard`.

### Minute 2: Inventory Catalog & Stock Inspection (1:00 - 2:00)
1. Show Dashboard metrics: Total Products, Total Units, Low Stock count, Total Revenue.
2. Navigate to **`/inventory`**.
3. Note the stock level of `USB-C Hub (11-in-1)` (e.g., 25 units).
4. Add a quick new product or edit an existing item to demonstrate live CRUD operations.

### Minute 3: Atomic Invoice Creation & Stock Deduction (2:00 - 3:00)
1. Navigate to **`/invoices/new`**.
2. Enter Customer Name: `Acme Corp`.
3. Search `USB-C Hub` and add 5 units to cart.
4. Set **Discount %** to `10%`.
5. Point out live formula breakdown: Subtotal, Discount, Tax (10%), and Final Total.
6. Click **"Create Invoice"**.
7. Observe instant confirmation with generated `INV-XXXX` number.

### Minute 4: Stock Verification & Oversell Prevention (3:00 - 4:00)
1. Return to **`/inventory`**. Verify `USB-C Hub` stock has decreased from 25 to 20 units automatically.
2. Return to **`/invoices/new`**. Try adding 99,999 units of `USB-C Hub`.
3. Show that UI and server block overselling with message: *"Only 20 units of USB-C Hub are currently available."*

### Minute 5: Invoice Cancellation & Stock Restoration (4:00 - 5:00)
1. Navigate to **`/invoices`**. Open the newly created `Acme Corp` invoice.
2. Click **"Cancel Invoice"** and confirm in the prompt.
3. Observe status change to `CANCELLED`.
4. Return to **`/inventory`** and demonstrate that stock has returned to 25 units.
5. Conclude demo.
