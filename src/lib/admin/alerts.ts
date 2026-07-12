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

export async function showAdminSuccess(title: string, text: string) {
  return Swal.fire({
    ...base,
    icon: "success",
    title,
    text,
    confirmButtonText: "Done",
    timer: 2200,
    timerProgressBar: true,
  });
}

export async function showAdminError(title: string, text: string) {
  return Swal.fire({
    ...base,
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
  });
}

export async function confirmAdminAction(options: {
  title: string;
  text: string;
  confirmText?: string;
}) {
  const result = await Swal.fire({
    ...base,
    icon: "warning",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Confirm",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  return result.isConfirmed;
}
