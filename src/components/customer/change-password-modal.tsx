"use client";

import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";

import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { cn } from "@/lib/utils";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
};

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function PasswordField({ id, label, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-700" htmlFor={id}>
        {label}
      </label>
      <div className="flex h-11 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 transition-all duration-200 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-100">
        <input
          className="h-full w-full border-none bg-transparent p-0 text-sm text-neutral-800 outline-none"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordModal({ open, onClose, onSave }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }, [open]);

  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && next.length >= 8 && next === confirm;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    onSave();
  };

  return (
    <div
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[60]", open ? "pointer-events-auto" : "pointer-events-none")}
    >
      <button
        aria-label="Close"
        className={cn(
          "absolute inset-0 bg-neutral-950/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        type="button"
      />

      <div className="absolute inset-0 flex items-end justify-center sm:items-center">
        <div
          className={cn(
            "flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-200 sm:max-w-md sm:rounded-2xl",
            open ? "translate-y-0" : "translate-y-full sm:translate-y-4"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <h3 className="font-heading text-base font-bold text-neutral-900">Change Password</h3>
            <button
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="flex-1 space-y-4 overflow-y-auto px-5 py-4" onSubmit={handleSubmit}>
            <PasswordField
              id="current-password"
              label="Current Password"
              onChange={setCurrent}
              value={current}
            />
            <div className="space-y-2">
              <PasswordField
                id="new-password"
                label="New Password"
                onChange={setNext}
                value={next}
              />
              {next.length > 0 ? <PasswordStrengthIndicator password={next} /> : null}
            </div>
            <div className="space-y-1.5">
              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                onChange={setConfirm}
                value={confirm}
              />
              {mismatch ? (
                <p className="text-xs text-red-600">Passwords do not match</p>
              ) : null}
            </div>
          </form>

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSave}
              onClick={handleSubmit}
              type="button"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
