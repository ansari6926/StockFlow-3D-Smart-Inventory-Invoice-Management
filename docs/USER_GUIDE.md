# StockFlow 3D — User Guide & System Manual

## 1. Quick Start & Setup

### 1.1 Accessing the Application
- **URL**: `https://luxpmecozsggeootwcwq.supabase.co` (Local Dev: `http://localhost:3000`)
- **Demo Credentials**:
  - **Email**: `demo@stockflow.app`
  - **Password**: `StockFlow2024!`

---

## 2. Operating the System

### 2.1 Viewing Dashboard Analytics
Navigate to `/dashboard` to view real-time operations metrics:
- **Total Products**: Number of active SKUs in inventory catalog.
- **Total Units**: Aggregate count of physical items in stock across all products.
- **Low Stock Alerts**: Count of items currently at or below their individual reorder threshold.
- **Total Revenue**: Cumulative revenue calculated from all `PAID` status invoices.
- **Recent Invoices & Low Stock Tables**: Quick access shortcuts to recent transactions and critical stock levels.

### 2.2 Managing Inventory (`/inventory`)
- **Add Product**: Click **"Add Product"**, enter SKU, Name, Category, Price ($), Stock Quantity, and Reorder Threshold.
- **Edit Product**: Click the pencil icon on any table row to modify price or stock.
- **Delete Product**: Click the trash icon (Note: Products used in existing invoices cannot be deleted due to financial audit constraints).
- **Search & Filter**: Search live catalog by SKU or product name, or filter by category.

### 2.3 Creating Invoices (`/invoices/new`)
1. Enter **Customer Name** (required).
2. Use product search box to find and click products to add to cart.
3. Adjust quantities using `+` / `-` buttons or direct numeric input (cannot exceed available stock).
4. Enter **Discount %** (0% to 100%).
5. Click **"Create Invoice"**. Stock is atomically deducted from database and an `INV-XXXX` number is generated.

### 2.4 Cancelling Invoices (`/invoices/[id]`)
1. Open any invoice from the `/invoices` list.
2. If status is `PAID`, click **"Cancel Invoice"**.
3. Confirm cancellation in the safety prompt.
4. Status converts to `CANCELLED` and stock quantities are automatically restored to inventory.
