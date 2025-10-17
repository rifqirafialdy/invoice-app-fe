import { z } from 'zod';

const MAX_FILE_SIZE = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const logoSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length === 1, "Logo file is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 1MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().min(1, 'Company name is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
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
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

export const emailChangeSchema = z.object({
  newEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  currentPassword: z.string().min(1, { message: 'Password is required.' }),
});

export type EmailChangeFormData = z.infer<typeof emailChangeSchema>;
export type LogoFormData = z.infer<typeof logoSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;