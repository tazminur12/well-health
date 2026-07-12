import { z } from "zod";

export const staffAccessLevelSchema = z.enum(["ADMIN", "SUPPORT"]);

export const createStaffRoleSchema = z.object({
  name: z.string().trim().min(2, "Role name is required").max(60),
  description: z.string().trim().max(300).optional(),
  accessLevel: staffAccessLevelSchema,
});

export const updateStaffRoleSchema = createStaffRoleSchema;

export const updateStaffRolePermissionsSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(300).optional(),
  permissions: z.array(z.string().trim().min(1)).default([]),
});

export const createStaffAccountSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  roleId: z.string().trim().min(1, "Select a role"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const inviteStaffSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Enter a valid email"),
  roleId: z.string().trim().min(1, "Select a role"),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().trim().min(20, "Invalid invite token"),
    name: z.string().trim().min(2, "Full name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type CreateStaffRoleInput = z.infer<typeof createStaffRoleSchema>;
export type UpdateStaffRoleInput = z.infer<typeof updateStaffRoleSchema>;
export type UpdateStaffRolePermissionsInput = z.infer<
  typeof updateStaffRolePermissionsSchema
>;
export type CreateStaffAccountInput = z.infer<typeof createStaffAccountSchema>;
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
