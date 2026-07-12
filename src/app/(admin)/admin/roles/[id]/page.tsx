"use client";

import {
  ArrowLeft,
  Check,
  Loader2,
  Lock,
  Save,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useRoleMutations, useStaffRole } from "@/hooks/use-admin-roles";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import {
  ADMIN_PERMISSIONS,
  ALL_ADMIN_PERMISSION_KEYS,
  type AdminPermissionKey,
} from "@/lib/roles/permissions";
import { cn } from "@/lib/utils";

export default function AdminRoleDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: role, isLoading, isError, error, refetch } = useStaffRole(params.id);
  const { updatePermissions } = useRoleMutations();
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<AdminPermissionKey[]>([]);

  const locked = role?.slug === "super-admin";
  const isCustomer = role?.accessLevel === "CUSTOMER";
  const readOnly = locked || isCustomer;

  useEffect(() => {
    if (!role) return;
    setDescription(role.description);
    setSelected(
      locked ? [...ALL_ADMIN_PERMISSION_KEYS] : [...role.permissions]
    );
  }, [locked, role]);

  const enabledCount = selected.length;

  const dirty = useMemo(() => {
    if (!role) return false;
    const current = [...role.permissions].sort().join(",");
    const next = [...selected].sort().join(",");
    return current !== next || description.trim() !== (role.description ?? "").trim();
  }, [description, role, selected]);

  function toggle(key: AdminPermissionKey) {
    if (readOnly) return;
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }

  function selectAll() {
    if (readOnly) return;
    setSelected([...ALL_ADMIN_PERMISSION_KEYS]);
  }

  function clearAll() {
    if (readOnly) return;
    setSelected([]);
  }

  function handleSave() {
    if (!role || readOnly) return;
    startTransition(async () => {
      try {
        await updatePermissions.mutateAsync({
          id: role.id,
          input: {
            description,
            permissions: selected,
          },
        });
        await showAdminSuccess("Access updated", "Permission changes are saved for this role.");
        await refetch();
      } catch (err) {
        await showAdminError(
          "Save failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading role…
      </div>
    );
  }

  if (isError || !role) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Role not found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "This role may have been deleted."}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-brand-green-600 hover:underline"
          href="/admin/roles"
        >
          Back to roles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-green-600"
          href="/admin/roles"
        >
          <ArrowLeft className="h-4 w-4" />
          All roles
        </Link>
        {!readOnly ? (
          <Button
            className="h-11 rounded-xl bg-brand-green-600 px-5 text-white hover:bg-brand-green-900"
            disabled={isPending || !dirty}
            onClick={handleSave}
            type="button"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save access
          </Button>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-[radial-gradient(circle_at_top_right,rgba(22,135,93,0.12),transparent_40%),linear-gradient(135deg,#f8fbf9,#ffffff)] px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-600 text-white shadow-sm">
              <Shield className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-neutral-900">{role.name}</h1>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                    role.accessLevel === "ADMIN"
                      ? "bg-brand-green-100 text-brand-green-800"
                      : role.accessLevel === "SUPPORT"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-sky-50 text-sky-800"
                  )}
                >
                  {role.accessLevel}
                </span>
                {role.isSystem ? (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                    System
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {role.memberCount}{" "}
                {role.accessLevel === "CUSTOMER" ? "customers" : "members"} · {enabledCount} modules
                enabled
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Description</span>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              disabled={readOnly}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>

          {locked ? (
            <p className="inline-flex items-center gap-2 rounded-xl bg-brand-green-100/60 px-3 py-2 text-sm text-brand-green-900">
              <Lock className="h-4 w-4" />
              Super Admin always has full access. Permissions cannot be restricted.
            </p>
          ) : null}
          {isCustomer ? (
            <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
              Customer accounts use the storefront only. Admin module access does not apply.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-neutral-900">Module access</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose which admin areas this role can open.
            </p>
          </div>
          {!readOnly ? (
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                onClick={selectAll}
                type="button"
              >
                Select all
              </button>
              <button
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                onClick={clearAll}
                type="button"
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_PERMISSIONS.map((permission) => {
            const checked = selected.includes(permission.key);
            return (
              <button
                key={permission.key}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all duration-200",
                  checked
                    ? "border-brand-green-600 bg-brand-green-100/40 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-brand-green-600/40",
                  readOnly && "cursor-default opacity-90"
                )}
                disabled={readOnly}
                onClick={() => toggle(permission.key)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{permission.label}</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {permission.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      checked
                        ? "border-brand-green-600 bg-brand-green-600 text-white"
                        : "border-neutral-300 bg-white text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
