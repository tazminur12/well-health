"use client";

import {
  closeAlert,
  showError,
  showInfo,
  showLoading,
  showSuccess,
} from "@/lib/alerts";

export async function showAuthSuccess(title: string, text: string) {
  return showSuccess(title, text);
}

export async function showAuthError(title: string, text: string) {
  return showError(title, text);
}

export async function showAuthInfo(title: string, text: string) {
  return showInfo(title, text);
}

export async function showAuthLoading(title = "Please wait...") {
  return showLoading(title);
}

export function closeAuthAlert() {
  closeAlert();
}
