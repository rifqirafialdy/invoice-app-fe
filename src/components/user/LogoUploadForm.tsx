'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
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
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { logoSchema, type LogoFormData } from '@/lib/validations/user'; 

export default function LogoUploadForm() {
  const { user, uploadLogo } = useAuthStore();

  const form = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
  });

  const selectedFile = form.watch('file')?.[0];
  const currentLogoUrl = user?.logoUrl;

  const onSubmit = async (data: LogoFormData) => {
    try {
      const file = data.file[0];
      await uploadLogo(file);
      
      form.reset({ file: undefined });
      form.setError('root', { message: 'Logo uploaded successfully!', type: 'success' }); 
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to upload logo';
      form.setError('root', { message: errorMessage });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <div className={`p-3 rounded-md text-sm ${
            form.formState.errors.root.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="size-20 border rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
            {currentLogoUrl ? (
              <Image 
                src={currentLogoUrl} 
                alt="Company Logo" 
                width={80} 
                height={80} 
                className="object-contain" 
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>
          
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>Choose Image (JPG, PNG, WebP) </FormLabel>
                <FormControl>
                  <Input 
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="w-full"
                    onChange={(event) => {
                      onChange(event.target.files && event.target.files);
                      event.target.value = ''; 
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end pt-2">
          {selectedFile && (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Uploading...' : 'Upload Logo'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}