import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .refine(
      (password) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const noSpaces = /^\S*$/.test(password);
        
        return hasMinLength && hasUpperCase && hasLowerCase && hasNumberOrSpecial && noSpaces;
      },
      {
        message: 'Password must be at least 8 characters with one uppercase, one lowercase, one number or special character, and no spaces'
      }
    ),
  confirmPassword: z.string(),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;