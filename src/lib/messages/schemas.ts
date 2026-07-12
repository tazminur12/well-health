import { z } from "zod";

export const contactMessageStatusSchema = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);
export const contactMessageFilterSchema = z.enum([
  "all",
  "new",
  "read",
  "replied",
  "archived",
]);

export const submitContactMessageSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  phone: z.string().trim().min(8, "Phone is required").max(30),
  email: z.string().trim().email("Enter a valid email").max(160),
  subject: z.string().trim().min(2, "Subject is required").max(200),
  message: z.string().trim().min(5, "Message is required").max(5000),
  source: z.enum(["contact", "home"]).default("contact"),
});

export const updateContactMessageSchema = z.object({
  status: contactMessageStatusSchema.optional(),
  adminNotes: z.string().trim().max(5000).optional().nullable(),
});

export type ContactMessageStatus = z.infer<typeof contactMessageStatusSchema>;
export type ContactMessageFilter = z.infer<typeof contactMessageFilterSchema>;
export type SubmitContactMessageInput = z.infer<typeof submitContactMessageSchema>;
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>;

export type AdminContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  adminNotes: string | null;
  source: string;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
