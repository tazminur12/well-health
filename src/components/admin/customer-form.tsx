"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Shield,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";

import type { AdminCustomer, CustomerStatus } from "@/components/admin/customers-data";
import { Button } from "@/components/ui/button";
import { useCustomerMutations } from "@/hooks/use-admin-customers";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { cn } from "@/lib/utils";

type CustomerFormProps = {
  mode: "create" | "edit";
  customer?: AdminCustomer | null;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  isVip: boolean;
  status: CustomerStatus;
  notes: string;
};

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const router = useRouter();
  const { createCustomer, updateCustomer } = useCustomerMutations();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    isVip: false,
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    if (mode === "edit" && customer) {
      setForm({
        name: customer.name === "Unnamed customer" ? "" : customer.name,
        email: customer.email,
        phone: customer.phone === "—" ? "" : customer.phone,
        password: "",
        isVip: customer.isVip,
        status: customer.status,
        notes: customer.notes,
      });
    }
  }, [customer, mode]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    if (form.name.trim().length < 2) {
      void showAdminError("Missing name", "Enter the customer's full name.");
      return;
    }
    if (mode === "create") {
      if (!form.email.trim()) {
        void showAdminError("Missing email", "Email is required to create a login.");
        return;
      }
      if (form.password.length < 8) {
        void showAdminError("Weak password", "Use at least 8 characters with a number and uppercase letter.");
        return;
      }
    }
    if (form.phone.trim().length < 9) {
      void showAdminError("Invalid phone", "Enter a valid phone number.");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          const created = await createCustomer.mutateAsync({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            isVip: form.isVip,
            notes: form.notes.trim() || undefined,
            sendWelcomeEmail: false,
          });
          await showAdminSuccess("Customer created", "They can now sign in with the password you set.");
          router.push(`/admin/customers/${created.id}`);
          router.refresh();
          return;
        }

        if (!customer) return;
        await updateCustomer.mutateAsync({
          id: customer.id,
          input: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            isVip: form.isVip,
            status: form.status,
            notes: form.notes.trim() || undefined,
          },
        });
        await showAdminSuccess("Customer updated", "Profile changes are saved.");
        router.push(`/admin/customers/${customer.id}`);
        router.refresh();
      } catch (error) {
        await showAdminError(
          mode === "create" ? "Create failed" : "Update failed",
          error instanceof Error ? error.message : "Please try again."
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-green-600"
          href={mode === "edit" && customer ? `/admin/customers/${customer.id}` : "/admin/customers"}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Button
          className="h-11 rounded-xl bg-brand-green-600 px-5 text-white hover:bg-brand-green-900"
          disabled={isPending}
          onClick={handleSubmit}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Create customer" : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-neutral-900">Profile</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {mode === "create"
                ? "Creates a Supabase login and customer profile in one step."
                : "Email is tied to auth and cannot be changed here."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input
                className={inputClass}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Tazminur Rahman"
                value={form.name}
              />
            </Field>
            <Field label="Phone" required>
              <input
                className={inputClass}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="+8801XXXXXXXXX"
                value={form.phone}
              />
            </Field>
            <Field className="sm:col-span-2" label="Email" required={mode === "create"}>
              <input
                className={cn(inputClass, mode === "edit" && "bg-neutral-50 text-neutral-500")}
                disabled={mode === "edit"}
                onChange={(event) => update("email", event.target.value)}
                placeholder="customer@email.com"
                type="email"
                value={form.email}
              />
            </Field>

            {mode === "create" ? (
              <Field className="sm:col-span-2" label="Temporary password" required>
                <div className="relative">
                  <input
                    className={cn(inputClass, "pr-11")}
                    onChange={(event) => update("password", event.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            ) : null}

            <Field className="sm:col-span-2" label="Internal notes">
              <textarea
                className={cn(inputClass, "min-h-[110px] py-3")}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Support notes, preferences, or follow-ups…"
                rows={4}
                value={form.notes}
              />
            </Field>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-900">
              Account
            </h3>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-3 transition-colors hover:border-brand-green-600/40">
                <input
                  checked={form.isVip}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                  onChange={(event) => update("isVip", event.target.checked)}
                  type="checkbox"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                    <Star className="h-3.5 w-3.5 text-[#C9A24B]" />
                    VIP customer
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Highlights this account in filters and the customers table.
                  </span>
                </span>
              </label>

              {mode === "edit" ? (
                <label className="block space-y-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    <Shield className="h-3.5 w-3.5" />
                    Status
                  </span>
                  <select
                    className={inputClass}
                    onChange={(event) => update("status", event.target.value as CustomerStatus)}
                    value={form.status}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </label>
              ) : (
                <p className="rounded-xl bg-brand-green-100/50 px-3 py-2.5 text-xs leading-5 text-brand-green-900">
                  New customers start as <strong>Active</strong>. You can suspend them later from
                  the details page.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-neutral-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
