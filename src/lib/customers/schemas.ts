import { z } from "zod";

export const customerStatusSchema = z.enum(["Active", "Suspended"]);

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  isVip: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional(),
  sendWelcomeEmail: z.boolean().default(false),
});

export const updateCustomerSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  isVip: z.boolean().default(false),
  status: customerStatusSchema.default("Active"),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
