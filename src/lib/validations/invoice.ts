import { InvoiceStatus } from '@/types/invoice';
import { z } from 'zod';

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum([InvoiceStatus.DRAFT,InvoiceStatus.SENT,InvoiceStatus.PAID,InvoiceStatus.CANCELLED,InvoiceStatus.OVERDUE,InvoiceStatus.DUE]),
  taxRate: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1')
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
   isRecurring: z.boolean().optional(),                          
  recurringFrequency: z.string().optional(),                    
}).refine((data) => {
  if (data.isRecurring && !data.recurringFrequency) {
    return false;
  }
  return true;
}, {
  message: "Recurring frequency is required when invoice is recurring",
  path: ["recurringFrequency"],
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;