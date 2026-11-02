import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const propertySchema = z.object({
  name: z
    .string()
    .min(1, 'Property name is required')
    .max(200, 'Property name cannot exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location cannot exceed 200 characters'),
  bedrooms: z
    .union([z.number().int().min(0, 'Bedrooms cannot be negative'), z.nan(), z.null(), z.undefined()])
    .optional(),
  bathrooms: z
    .union([z.number().int().min(0, 'Bathrooms cannot be negative'), z.nan(), z.null(), z.undefined()])
    .optional(),
  maxGuests: z
    .union([z.number().int().min(1, 'Maximum guests must be at least 1'), z.nan(), z.null(), z.undefined()])
    .optional(),
  whatsAppNumber: z
    .string()
    .min(1, 'WhatsApp number is required')
    .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid international phone number (e.g. +919876543210)'),
  status: z.enum(['Draft', 'Active', 'Inactive']),
  facilityIds: z.array(z.string()).default([]),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export const facilitySchema = z.object({
  name: z
    .string()
    .min(1, 'Facility name is required')
    .max(100, 'Facility name cannot exceed 100 characters'),
  isActive: z.boolean().default(true),
});

export type FacilityFormData = z.infer<typeof facilitySchema>;
