"use client";

import {
  Camera,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  Save,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";

import { AdminChangePasswordModal } from "@/components/admin/admin-change-password-modal";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { useAdminProfile, useAdminProfileMutations } from "@/hooks/use-admin-profile";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined, email: string) {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminProfilePage() {
  const { data: profile, isLoading, isError, error, refetch } = useAdminProfile();
  const { updateProfile, changePassword, uploadAvatar, removeAvatar } =
    useAdminProfileMutations();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  function cancelEdit() {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateProfile.mutateAsync({ name, phone });
        setEditing(false);
        await showAdminSuccess("Profile saved", "Your account details were updated.");
        await refetch();
      } catch (err) {
        await showAdminError(
          "Save failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      await showAdminSuccess("Avatar updated", "Your profile photo is ready.");
      await refetch();
    } catch (err) {
      await showAdminError(
        "Upload failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleRemoveAvatar() {
    try {
      await removeAvatar.mutateAsync();
      await showAdminSuccess("Avatar removed", "Showing initials instead.");
      await refetch();
    } catch (err) {
      await showAdminError(
        "Remove failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading profile…
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn&apos;t load profile
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button className="mt-5 rounded-xl" onClick={() => void refetch()} type="button">
          Try again
        </Button>
      </div>
    );
  }

  const busy =
    isPending ||
    updateProfile.isPending ||
    uploadAvatar.isPending ||
    removeAvatar.isPending;
  const initials = getInitials(profile.name, profile.email);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">My profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your admin account details, photo, and password
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.14),_transparent_40%),linear-gradient(135deg,_#0b4d3a_0%,_#16875d_100%)] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 shadow-lg">
                {profile.avatarUrl ? (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="96px"
                    src={profile.avatarUrl}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-heading text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                ref={fileInputRef}
                type="file"
              />
              <button
                aria-label="Change photo"
                className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-green-700 shadow-md hover:bg-brand-green-50 disabled:opacity-60"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {uploadAvatar.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-heading text-2xl font-bold tracking-tight">
                {profile.name?.trim() || "Admin"}
              </p>
              <p className="mt-1 truncate text-sm text-white/80">{profile.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Shield className="h-3.5 w-3.5" />
                  {profile.roleLabel}
                </span>
                <span className="inline-flex items-center rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  Joined {formatJoined(profile.createdAt)}
                </span>
              </div>
            </div>

            {profile.avatarUrl ? (
              <Button
                className="h-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                disabled={busy}
                onClick={() => void handleRemoveAvatar()}
                type="button"
                variant="outline"
              >
                Remove photo
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">Personal details</h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                Name and phone sync across your admin session
              </p>
            </div>
          </div>

          {!editing ? (
            <Button
              className="h-10 rounded-xl"
              onClick={() => setEditing(true)}
              type="button"
              variant="outline"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                className="h-10 rounded-xl"
                disabled={busy}
                onClick={cancelEdit}
                type="button"
                variant="outline"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
                disabled={busy || name.trim().length < 2}
                onClick={handleSave}
                type="button"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Full name
            </label>
            {editing ? (
              <input
                className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            ) : (
              <p className="text-sm font-medium text-neutral-900">
                {profile.name?.trim() || "—"}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Mail className="h-3.5 w-3.5" />
              Email
            </label>
            <p className="rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-600">
              {profile.email}
            </p>
            <p className="text-[11px] text-neutral-400">Email can&apos;t be changed here</p>
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </label>
            {editing ? (
              <input
                className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+8801XXXXXXXXX"
                value={phone}
              />
            ) : (
              <p className="text-sm font-medium text-neutral-900">{profile.phone || "—"}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Access role
            </label>
            <p className="text-sm font-medium text-neutral-900">{profile.roleLabel}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Account status
            </label>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                profile.status === "ACTIVE"
                  ? "bg-brand-green-100 text-brand-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {profile.status === "ACTIVE" ? "Active" : profile.status}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Lock className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Security</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Keep your admin account protected with a strong password
            </p>
            <Button
              className="mt-4 h-10 rounded-xl"
              onClick={() => setPasswordOpen(true)}
              type="button"
              variant="outline"
            >
              <Lock className="h-4 w-4" />
              Change password
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-heading text-lg font-bold text-neutral-900">Session</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sign out of the admin panel on this device
        </p>
        <LogoutButton className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
          Sign out
        </LogoutButton>
      </section>

      <AdminChangePasswordModal
        isSaving={changePassword.isPending}
        onClose={() => setPasswordOpen(false)}
        onSave={async (values) => {
          try {
            await changePassword.mutateAsync(values);
            setPasswordOpen(false);
            await showAdminSuccess(
              "Password updated",
              "Use your new password the next time you sign in."
            );
          } catch (err) {
            await showAdminError(
              "Password change failed",
              err instanceof Error ? err.message : "Please try again."
            );
          }
        }}
        open={passwordOpen}
      />
    </div>
  );
}
