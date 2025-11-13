import { z } from 'zod';

/**
 * Security validation schemas to prevent injection attacks
 */

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "First name contains invalid characters" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be less than 50 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Last name contains invalid characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{10,20}$/, { message: "Invalid phone number format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor']),
  nationalId: z.string().trim().max(50).optional(),
  license: z.string().trim().max(50).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'patient') {
    return !!data.nationalId && data.nationalId.length > 0;
  }
  return true;
}, {
  message: "National ID is required for patients",
  path: ["nationalId"],
}).refine((data) => {
  if (data.role === 'doctor') {
    return !!data.license && data.license.length > 0;
  }
  return true;
}, {
  message: "Medical license is required for doctors",
  path: ["license"],
});

// Profile update validation
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name contains invalid characters" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{10,20}$/, { message: "Invalid phone number format" })
    .optional(),
  clinic: z
    .string()
    .trim()
    .max(200, { message: "Clinic name must be less than 200 characters" })
    .optional(),
});

// Password change validation
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "Current password is required" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

// Search query sanitization
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s@.-]/g, '') // Allow only alphanumeric, spaces, @, ., and -
    .slice(0, 100); // Limit length
};

// URL parameter sanitization
export const sanitizeUrlParam = (param: string): string => {
  return encodeURIComponent(param.trim().slice(0, 200));
};

// Generic text input sanitization
export const sanitizeTextInput = (input: string, maxLength: number = 1000): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .slice(0, maxLength);
};

// Validate file uploads
export const validateFileUpload = (file: File, allowedTypes: string[], maxSizeMB: number) => {
  const errors: string[] = [];
  
  // Check file type
  const fileType = file.type.toLowerCase();
  if (!allowedTypes.some(type => fileType.includes(type))) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  // Check file name
  if (file.name.length > 255) {
    errors.push("File name too long");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
