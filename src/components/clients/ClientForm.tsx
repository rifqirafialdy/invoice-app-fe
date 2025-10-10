'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientApi } from '@/lib/api/clientApi';
import { clientSchema, type ClientFormData } from '@/lib/validations/client';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import SuccessDialog from '@/components/common/SuccessDialog';
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
import type { Client } from '@/types/client';

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState({ isOpen: false, title: '', description: '' });
  const isEditMode = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      paymentPreferences: client?.paymentPreferences || '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client) {
        await clientApi.update(client.id, data);
        setSuccessState({ isOpen: true, title: 'Client Updated!', description: 'Your changes have been saved.' });
      } else {
        await clientApi.create(data);
        setSuccessState({ isOpen: true, title: 'Client Created!', description: 'The new client is now available.' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save client';
      form.setError('root', { message: errorMessage });
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessState({ isOpen: false, title: '', description: '' });
    onSuccess();
    form.reset();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="space-y-6">
          {form.formState.errors.root && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {form.formState.errors.root.message}
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="123 Main Street, City, State, ZIP" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Preferences</FormLabel>
                <FormControl>
                  <Input placeholder="Bank Transfer, Credit Card, etc." {...field} />
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
              {form.formState.isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={form.handleSubmit(onSubmit)}
        title={isEditMode ? 'Confirm Update' : 'Confirm Creation'}
        description={`Are you sure you want to ${isEditMode ? 'update this client' : 'create this new client'}?`}
        confirmText={isEditMode ? 'Update' : 'Create'}
        isDestructive={false}
      />

      <SuccessDialog
        isOpen={successState.isOpen}
        onClose={handleSuccessDialogClose}
        title={successState.title}
        description={successState.description}
      />
    </>
  );
}