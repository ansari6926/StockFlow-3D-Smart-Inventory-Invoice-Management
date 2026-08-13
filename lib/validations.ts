import { z } from 'zod';

export const ProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().max(1000).optional().default(''),
  category: z.string().max(100).optional().default('General'),
  price: z.number().positive('Price must be greater than 0'),
  stock_quantity: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  reorder_threshold: z.number().int('Reorder threshold must be a whole number').min(0, 'Reorder threshold cannot be negative'),
});

export const InvoiceItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0'),
});

export const CreateInvoiceSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required').max(200),
  items: z.array(InvoiceItemSchema).min(1, 'Invoice must have at least one item'),
  discount_pct: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%'),
  notes: z.string().max(500).optional().default(''),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ProductInput = z.infer<typeof ProductSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
