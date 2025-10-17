import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone number is too long').optional().or(z.literal('')),
  address: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  paymentPreferences: z.string().max(255, 'Payment preferences is too long').optional().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;