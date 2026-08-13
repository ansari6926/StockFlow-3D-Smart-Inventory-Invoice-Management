-- ============================================================
-- StockFlow 3D — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Demo products (realistic inventory)
INSERT INTO products (sku, name, description, category, price, stock_quantity, reorder_threshold) VALUES
  ('ELC-001', 'MacBook Pro 14"',       'Apple M3 Pro chip, 18GB RAM, 512GB SSD',          'Electronics',   2499.00, 25,  5),
  ('ELC-002', 'Dell XPS 15',           'Intel Core i9, 32GB RAM, 1TB NVMe SSD',           'Electronics',   1899.99, 18,  5),
  ('ELC-003', 'Sony WH-1000XM5',       'Industry-leading noise canceling headphones',     'Electronics',    349.99, 42, 10),
  ('ELC-004', 'iPad Pro 12.9"',        'M2 chip, Liquid Retina XDR display, 256GB',       'Electronics',   1099.00, 30,  8),
  ('ELC-005', 'Samsung 4K Monitor 32"','Ultra-wide curved, 144Hz, USB-C',                 'Electronics',    799.00,  4, 10),
  ('OFF-001', 'Herman Miller Chair',   'Aeron ergonomic office chair, size B',             'Furniture',     1595.00, 12,  3),
  ('OFF-002', 'Standing Desk L-Shape', 'Electric height-adjustable, solid wood top',      'Furniture',      899.00,  8,  3),
  ('OFF-003', 'Logitech MX Master 3S', 'Advanced wireless mouse, 8K DPI',                 'Peripherals',     99.99, 65, 15),
  ('OFF-004', 'Keychron K2 Pro',       'Wireless mechanical keyboard, hot-swap',          'Peripherals',    129.99, 48, 12),
  ('STO-001', 'USB-C Hub 12-in-1',     'HDMI 4K, SD card, 100W PD, Ethernet',             'Accessories',    79.99, 90, 20),
  ('STO-002', 'SanDisk Extreme SSD 2TB','Portable NVMe SSD, 2000MB/s read',               'Storage',        219.99, 35, 10),
  ('STO-003', 'Thunderbolt 4 Dock',    'OWC Thunderbolt 4 hub with 96W charging',         'Accessories',    249.00, 15,  5),
  ('NET-001', 'Ubiquiti UniFi AP',     'WiFi 6E access point, 6 GHz, enterprise-grade',  'Networking',     299.00, 22,  5),
  ('CAM-001', 'Logitech C930e Webcam', '1080p HD, 90-degree FOV, enterprise',             'Peripherals',    129.99, 38, 10),
  ('PWR-001', 'Anker PowerBank 26800', '26800mAh, 65W USB-C, 3-port charging',            'Accessories',     89.99,  3, 10)
ON CONFLICT (sku) DO NOTHING;
