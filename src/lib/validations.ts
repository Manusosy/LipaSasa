import { z } from 'zod';

// Phone number validation for Kenya (254 format)
export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^(254|0)[17]\d{8}$/, 'Invalid phone number. Use format: 254712345678 or 0712345678')
  .transform((val) => {
    // Convert 07... to 2547...
    if (val.startsWith('0')) {
      return '254' + val.slice(1);
    }
    return val;
  });

// Invoice validation
export const createInvoiceSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters'),
  customer_email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount is too large')
    .refine((val) => Number.isFinite(val), 'Amount must be a valid number'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  currency: z.enum(['KSH', 'USD', 'EUR']).default('KSH'),
});

// M-PESA credentials validation
export const mpesaCredentialsSchema = z.object({
  consumer_key: z
    .string()
    .trim()
    .min(10, 'Consumer key is required')
    .max(255, 'Consumer key is too long'),
  consumer_secret: z
    .string()
    .trim()
    .min(10, 'Consumer secret is required')
    .max(255, 'Consumer secret is too long'),
  shortcode: z
    .string()
    .trim()
    .regex(/^\d{5,7}$/, 'Shortcode must be 5-7 digits'),
  passkey: z
    .string()
    .trim()
    .min(10, 'Passkey is required')
    .max(255, 'Passkey is too long'),
  nominated_phone: phoneNumberSchema.optional().or(z.literal('')),
});

// Payment validation for pay page
export const paymentSchema = z.object({
  phone: phoneNumberSchema,
  invoice_id: z.string().uuid('Invalid invoice ID'),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  owner_name: z
    .string()
    .trim()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: phoneNumberSchema.optional().or(z.literal('')),
  country: z.string().trim().min(2, 'Country is required').max(100),
  industry: z.string().trim().max(100).optional().or(z.literal('')),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type MpesaCredentialsInput = z.infer<typeof mpesaCredentialsSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
