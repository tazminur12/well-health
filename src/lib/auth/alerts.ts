"use client";

import Swal from "sweetalert2";

import "sweetalert2/dist/sweetalert2.min.css";

const base = {
  buttonsStyling: false,
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

export async function showAuthSuccess(title: string, text: string) {
  return Swal.fire({
    ...base,
    icon: "success",
    title,
    text,
    confirmButtonText: "Continue",
    timer: 2600,
    timerProgressBar: true,
  });
}

export async function showAuthError(title: string, text: string) {
  return Swal.fire({
    ...base,
    icon: "error",
    title,
    text,
    confirmButtonText: "Try again",
  });
}

export async function showAuthInfo(title: string, text: string) {
  return Swal.fire({
    ...base,
    icon: "info",
    title,
    text,
    confirmButtonText: "Got it",
  });
}

export async function showAuthLoading(title = "Please wait...") {
  return Swal.fire({
    ...base,
    title,
    text: "Securely processing your request",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function closeAuthAlert() {
  Swal.close();
}
