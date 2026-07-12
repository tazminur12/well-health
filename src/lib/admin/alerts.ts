"use client";

import { confirmAction, showError, showSuccess } from "@/lib/alerts";

export async function showAdminSuccess(title: string, text: string) {
  return showSuccess(title, text);
}

export async function showAdminError(title: string, text: string) {
  return showError(title, text);
}

export async function confirmAdminAction(options: {
  title: string;
  text: string;
  confirmText?: string;
}) {
  return confirmAction({
    title: options.title,
    text: options.text,
    confirmText: options.confirmText ?? "Confirm",
    cancelText: "Cancel",
    icon: "warning",
  });
}
