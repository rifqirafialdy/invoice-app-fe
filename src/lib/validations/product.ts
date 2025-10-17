import { z } from 'zod';
import { ProductType } from '@/types/product';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  price: z.number().min(1, 'Price must be positive'),
  type: z.enum([ProductType.PRODUCT, ProductType.SERVICE]),
});

export type ProductFormData = z.infer<typeof productSchema>;