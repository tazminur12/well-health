import { z } from "zod";

export const adminProfileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const adminPasswordChangeSchema = z
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

export type AdminProfileUpdateInput = z.infer<typeof adminProfileUpdateSchema>;
export type AdminPasswordChangeInput = z.infer<typeof adminPasswordChangeSchema>;
