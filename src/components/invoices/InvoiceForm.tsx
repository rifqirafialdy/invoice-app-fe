'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceApi } from '@/lib/api/invoiceApi';
import { clientApi } from '@/lib/api/clientApi';
import { productApi } from '@/lib/api/productApi';
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice';
import { InvoiceStatus, type Invoice } from '@/types/invoice';
import type { Client } from '@/types/client';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';


interface InvoiceFormProps {
  invoice?: Invoice;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: invoice?.clientId || '',
      issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate || '',
      status: invoice?.status || InvoiceStatus.DRAFT,
      taxRate: invoice?.taxRate || 11,
      items: invoice?.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })) || [{ productId: '', quantity: 1 }],
      notes: invoice?.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        clientApi.getAll(0, 100),
        productApi.getAll(0, 100),
      ]);
      setClients(clientsRes.data.data.content);
      setProducts(productsRes.data.data.content);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    const taxRate = form.watch('taxRate') || 0;

    const subtotal = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return sum;
      return sum + (product.price * item.quantity);
    }, 0);

    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total,
    };
  };

  const { subtotal, taxAmount, total } = calculateTotal();

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      if (invoice) {
        await invoiceApi.update(invoice.id, data);
      } else {
        await invoiceApi.create(data);
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save invoice';
      form.setError('root', { message: errorMessage });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
                    <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                    <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                    <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                    <SelectItem value={InvoiceStatus.DUE}>Due</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
  <FormField
    control={form.control}
    name="isRecurring"
    render={({ field }) => (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>
            Recurring Invoice
          </FormLabel>
        </div>
      </FormItem>
    )}
  />
</div>

{form.watch('isRecurring') && (
  <FormField
    control={form.control}
    name="recurringFrequency"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Recurring Frequency *</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
)}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: '', quantity: 1 })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <FormField
                  control={form.control}
                  name={`items.${index}.productId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="mt-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({form.watch('taxRate')}%):</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(taxAmount)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(total)}
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}