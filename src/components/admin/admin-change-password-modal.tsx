"use client";

import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";

type AdminChangePasswordModalProps = {
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void | Promise<void>;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-700" htmlFor={id}>
        {label}
      </label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 transition-all duration-200 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-600/20">
        <input
          autoComplete={id === "admin-current-password" ? "current-password" : "new-password"}
          className="h-full w-full border-none bg-transparent p-0 text-sm text-neutral-800 outline-none"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-50"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function AdminChangePasswordModal({
  open,
  isSaving,
  onClose,
  onSave,
}: AdminChangePasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSaving, onClose, open]);

  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && next.length >= 8 && next === confirm && !isSaving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    await onSave({
      currentPassword: current,
      newPassword: next,
      confirmPassword: confirm,
    });
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-[2px]"
        onClick={() => {
          if (!isSaving) onClose();
        }}
        type="button"
      />

      <div
        className="relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-change-password-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <div>
            <h3
              className="font-heading text-base font-bold text-neutral-900"
              id="admin-change-password-title"
            >
              Change password
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Use a strong password you don&apos;t reuse elsewhere
            </p>
          </div>
          <button
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="flex-1 space-y-4 overflow-y-auto px-5 py-4" onSubmit={handleSubmit}>
          <PasswordField
            id="admin-current-password"
            label="Current password"
            onChange={setCurrent}
            value={current}
          />
          <div className="space-y-2">
            <PasswordField
              id="admin-new-password"
              label="New password"
              onChange={setNext}
              value={next}
            />
            {next.length > 0 ? <PasswordStrengthIndicator password={next} /> : null}
          </div>
          <div className="space-y-1.5">
            <PasswordField
              id="admin-confirm-password"
              label="Confirm new password"
              onChange={setConfirm}
              value={confirm}
            />
            {mismatch ? <p className="text-xs text-red-600">Passwords do not match</p> : null}
          </div>
        </form>

        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900 disabled:opacity-50"
            disabled={!canSave}
            onClick={handleSubmit}
            type="button"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update password
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
