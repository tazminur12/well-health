"use client";

import Swal from "sweetalert2";

import "sweetalert2/dist/sweetalert2.min.css";

/** Shared SweetAlert2 config — classic look matching the product screenshot. */
export const swalBase = {
  buttonsStyling: false as const,
  customClass: {
    popup: "auth-swal-popup",
    title: "auth-swal-title",
    htmlContainer: "auth-swal-html",
    confirmButton: "auth-swal-confirm",
    cancelButton: "auth-swal-cancel",
    actions: "auth-swal-actions",
    icon: "auth-swal-icon",
  },
};

export async function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...swalBase,
    icon: "success",
    title,
    text: text ?? "",
    confirmButtonText: "OK",
  });
}

export async function showError(title: string, text?: string) {
  return Swal.fire({
    ...swalBase,
    icon: "error",
    title,
    text: text ?? "",
    confirmButtonText: "OK",
  });
}

export async function showInfo(title: string, text?: string) {
  return Swal.fire({
    ...swalBase,
    icon: "info",
    title,
    text: text ?? "",
    confirmButtonText: "OK",
  });
}

export async function showWarning(title: string, text?: string) {
  return Swal.fire({
    ...swalBase,
    icon: "warning",
    title,
    text: text ?? "",
    confirmButtonText: "OK",
  });
}

export async function confirmAction(options: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info";
}) {
  const result = await Swal.fire({
    ...swalBase,
    icon: options.icon ?? "warning",
    title: options.title,
    text: options.text ?? "",
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "OK",
    cancelButtonText: options.cancelText ?? "Cancel",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

export async function showLoading(title = "Please wait...") {
  return Swal.fire({
    ...swalBase,
    title,
    text: "This will only take a moment.",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function closeAlert() {
  Swal.close();
}
