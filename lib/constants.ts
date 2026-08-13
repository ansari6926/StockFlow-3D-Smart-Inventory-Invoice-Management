// ============================================================
// StockFlow 3D — Business Constants
// ============================================================

/** Tax rate applied after discount (10%) */
export const TAX_RATE_PCT = 10;

/** Maximum discount percentage allowed (100%) */
export const MAX_DISCOUNT_PCT = 100;

/** Low stock threshold multiplier — below reorder_threshold = low stock */
export const LOW_STOCK_MULTIPLIER = 1;

/** Invoice number prefix */
export const INVOICE_PREFIX = 'INV';

/** App name */
export const APP_NAME = 'StockFlow 3D';

/** App tagline */
export const APP_TAGLINE = 'Smart Inventory & Invoice Management';

/**
 * Invoice financial calculation formula:
 *
 * line_total = quantity × (trusted product price from DB)
 * subtotal   = Σ line_totals
 * discount   = subtotal × (discount_pct / 100)
 * tax        = (subtotal - discount) × (TAX_RATE_PCT / 100)
 * total      = subtotal - discount + tax
 *
 * Price is ALWAYS fetched from the trusted server-side DB.
 * Client-submitted prices are NEVER trusted.
 */
export const CALC_FORMULA = {
  lineTotalFormula: 'quantity × trusted_db_price',
  subtotalFormula: 'sum of line totals',
  discountFormula: 'subtotal × (discount_pct / 100)',
  taxFormula: '(subtotal - discount) × (TAX_RATE_PCT / 100)',
  totalFormula: 'subtotal - discount + tax',
} as const;
