import { z } from "zod";

export const customerProfileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid date of birth",
    }),
  gender: z.enum(["FEMALE", "MALE", "OTHER", "UNSPECIFIED"]),
});

export const customerPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password",
  });

export const customerPreferencesSchema = z.object({
  language: z.enum(["en", "bn"]),
  orderUpdates: z.boolean(),
  promotions: z.boolean(),
  newsletter: z.boolean(),
  sms: z.boolean(),
});

export const customerAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  district: z.string().trim().min(2, "Select a district"),
  area: z.string().trim().min(2, "Area / thana is required"),
  details: z.string().trim().min(5, "Enter a detailed address"),
  isDefault: z.boolean().optional().default(false),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: 'Type "DELETE" to confirm' }),
  }),
});

export type CustomerProfileUpdateInput = z.infer<typeof customerProfileUpdateSchema>;
export type CustomerPasswordChangeInput = z.infer<typeof customerPasswordChangeSchema>;
export type CustomerPreferencesInput = z.infer<typeof customerPreferencesSchema>;
export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
