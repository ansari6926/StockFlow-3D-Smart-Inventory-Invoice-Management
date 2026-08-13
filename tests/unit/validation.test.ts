import { describe, it, expect } from 'vitest';
import { ProductSchema, CreateInvoiceSchema, LoginSchema, SignUpSchema } from '@/lib/validations';

describe('ProductSchema', () => {
  const validProduct = {
    sku: 'ELC-001',
    name: 'Test Product',
    price: 99.99,
    stock_quantity: 10,
    reorder_threshold: 5,
  };

  it('accepts valid product data', () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects empty SKU', () => {
    const result = ProductSchema.safeParse({ ...validProduct, sku: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = ProductSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects price = 0', () => {
    const result = ProductSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = ProductSchema.safeParse({ ...validProduct, price: -10 });
    expect(result.success).toBe(false);
  });

  it('rejects negative stock_quantity', () => {
    const result = ProductSchema.safeParse({ ...validProduct, stock_quantity: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative reorder_threshold', () => {
    const result = ProductSchema.safeParse({ ...validProduct, reorder_threshold: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts stock_quantity = 0', () => {
    const result = ProductSchema.safeParse({ ...validProduct, stock_quantity: 0 });
    expect(result.success).toBe(true);
  });
});

describe('CreateInvoiceSchema', () => {
  const validInvoice = {
    customer_name: 'John Doe',
    items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 }],
    discount_pct: 10,
  };

  it('accepts valid invoice data', () => {
    const result = CreateInvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it('rejects empty customer name', () => {
    const result = CreateInvoiceSchema.safeParse({ ...validInvoice, customer_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty items array', () => {
    const result = CreateInvoiceSchema.safeParse({ ...validInvoice, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects quantity = 0', () => {
    const result = CreateInvoiceSchema.safeParse({
      ...validInvoice,
      items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = CreateInvoiceSchema.safeParse({
      ...validInvoice,
      items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects decimal quantity', () => {
    const result = CreateInvoiceSchema.safeParse({
      ...validInvoice,
      items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects discount > 100', () => {
    const result = CreateInvoiceSchema.safeParse({ ...validInvoice, discount_pct: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects negative discount', () => {
    const result = CreateInvoiceSchema.safeParse({ ...validInvoice, discount_pct: -5 });
    expect(result.success).toBe(false);
  });

  it('accepts discount = 0', () => {
    const result = CreateInvoiceSchema.safeParse({ ...validInvoice, discount_pct: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts discount = 100', () => {
    const result = CreateInvoiceSchema.safeParse({ ...validInvoice, discount_pct: 100 });
    expect(result.success).toBe(true);
  });

  it('rejects invalid product_id (not UUID)', () => {
    const result = CreateInvoiceSchema.safeParse({
      ...validInvoice,
      items: [{ product_id: 'not-a-uuid', quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('accepts valid login data', () => {
    const result = LoginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = LoginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = LoginSchema.safeParse({ email: 'test@example.com', password: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = LoginSchema.safeParse({ email: '', password: 'password123' });
    expect(result.success).toBe(false);
  });
});

describe('SignUpSchema', () => {
  it('accepts matching passwords and valid email', () => {
    const result = SignUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = SignUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = SignUpSchema.safeParse({
      email: 'user@example.com',
      password: '123',
      confirmPassword: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = SignUpSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });
});
