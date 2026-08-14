-- ============================================================
-- StockFlow 3D — PostgreSQL Schema
-- Apply this in Supabase: SQL Editor → New Query → Run All
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES TABLE (User Profile & Display Name)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        DEFAULT '',
  display_name TEXT        DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sku               TEXT        UNIQUE NOT NULL,
  name              TEXT        NOT NULL CHECK (char_length(name) > 0),
  description       TEXT        DEFAULT '',
  category          TEXT        DEFAULT 'General',
  price             NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock_quantity    INTEGER     NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_threshold INTEGER     NOT NULL DEFAULT 10 CHECK (reorder_threshold >= 0),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT        UNIQUE NOT NULL,
  customer_name  TEXT        NOT NULL CHECK (char_length(customer_name) > 0),
  subtotal       NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total          NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status         TEXT        NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'CANCELLED')),
  notes          TEXT        DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  created_by     UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================
-- INVOICE ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID        NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   INTEGER     NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_sku         ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock       ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_invoices_status      ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at  ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by  ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoice_items_inv    ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_prod   ON invoice_items(product_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INVOICE NUMBER SEQUENCE
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- ============================================================
-- RPC: CREATE INVOICE (Atomic Transaction)
-- ============================================================
CREATE OR REPLACE FUNCTION create_invoice(
  p_customer_name   TEXT,
  p_items           JSONB,   -- [{product_id, quantity}]
  p_discount_pct    NUMERIC, -- discount percentage 0-100
  p_tax_pct         NUMERIC, -- tax percentage 0-100
  p_notes           TEXT,
  p_created_by      UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_id     UUID;
  v_invoice_number TEXT;
  v_subtotal       NUMERIC(10,2) := 0;
  v_discount_amt   NUMERIC(10,2);
  v_tax_amt        NUMERIC(10,2);
  v_total          NUMERIC(10,2);
  v_item           JSONB;
  v_product        RECORD;
  v_line_total     NUMERIC(10,2);
  v_qty            INTEGER;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Invoice must contain at least one item';
  END IF;

  IF p_discount_pct < 0 OR p_discount_pct > 100 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Discount percentage must be between 0 and 100';
  END IF;
  IF p_tax_pct < 0 OR p_tax_pct > 100 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Tax percentage must be between 0 and 100';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: Quantity must be a positive integer';
    END IF;

    SELECT id, name, price, stock_quantity
    INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: Product % not found', v_item->>'product_id';
    END IF;

    IF v_product.stock_quantity < v_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: Only % units of "%" are currently available',
        v_product.stock_quantity, v_product.name;
    END IF;
  END LOOP;

  v_invoice_number := 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;

    SELECT price, stock_quantity INTO v_product
    FROM products WHERE id = (v_item->>'product_id')::UUID;

    v_line_total := v_product.price * v_qty;
    v_subtotal   := v_subtotal + v_line_total;
  END LOOP;

  v_discount_amt := ROUND(v_subtotal * p_discount_pct / 100, 2);
  v_tax_amt      := ROUND((v_subtotal - v_discount_amt) * p_tax_pct / 100, 2);
  v_total        := v_subtotal - v_discount_amt + v_tax_amt;

  IF v_total < 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Invoice total cannot be negative';
  END IF;

  INSERT INTO invoices (
    invoice_number, customer_name, subtotal, discount, tax, total, notes, created_by, status
  ) VALUES (
    v_invoice_number, p_customer_name, v_subtotal, v_discount_amt, v_tax_amt, v_total, p_notes, p_created_by, 'PAID'
  ) RETURNING id INTO v_invoice_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;

    SELECT price INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;
    v_line_total := v_product.price * v_qty;

    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, line_total)
    VALUES (v_invoice_id, (v_item->>'product_id')::UUID, v_qty, v_product.price, v_line_total);

    UPDATE products
    SET stock_quantity = stock_quantity - v_qty
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  RETURN jsonb_build_object(
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'total', v_total
  );
END;
$$;

-- ============================================================
-- RPC: CANCEL INVOICE (Atomic Transaction)
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_invoice(
  p_invoice_id UUID,
  p_user_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice RECORD;
  v_item    RECORD;
BEGIN
  SELECT id, status, created_by INTO v_invoice
  FROM invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Invoice not found';
  END IF;

  IF v_invoice.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'ALREADY_CANCELLED: This invoice has already been cancelled';
  END IF;

  UPDATE invoices SET status = 'CANCELLED' WHERE id = p_invoice_id;

  FOR v_item IN
    SELECT product_id, quantity FROM invoice_items WHERE invoice_id = p_invoice_id
  LOOP
    UPDATE products
    SET stock_quantity = stock_quantity + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object(
    'invoice_id', p_invoice_id,
    'status', 'CANCELLED',
    'message', 'Invoice cancelled and stock restored successfully'
  );
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select/update their own profile
DROP POLICY IF EXISTS "profiles_authenticated_select" ON profiles;
CREATE POLICY "profiles_authenticated_select" ON profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_self_upsert" ON profiles;
CREATE POLICY "profiles_self_upsert" ON profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Products: authenticated users can read/write
DROP POLICY IF EXISTS "products_authenticated" ON products;
CREATE POLICY "products_authenticated" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoices: authenticated users can read/write
DROP POLICY IF EXISTS "invoices_authenticated" ON invoices;
CREATE POLICY "invoices_authenticated" ON invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoice items: authenticated users can read/write
DROP POLICY IF EXISTS "invoice_items_authenticated" ON invoice_items;
CREATE POLICY "invoice_items_authenticated" ON invoice_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
