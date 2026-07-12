"use client";

import {
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  useRoleMutations,
  useStaffInvites,
  useStaffMembers,
  useStaffRoles,
} from "@/hooks/use-admin-roles";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { AdminStaffRole } from "@/lib/roles/mapper";
import { cn } from "@/lib/utils";

type TabId = "roles" | "members" | "invites";

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition-colors focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

export default function AdminRolesPage() {
  const [tab, setTab] = useState<TabId>("roles");
  const { data: roles = [], isLoading: rolesLoading } = useStaffRoles();
  const { data: members = [], isLoading: membersLoading } = useStaffMembers();
  const { data: invites = [], isLoading: invitesLoading } = useStaffInvites();
  const mutations = useRoleMutations();

  const stats = useMemo(
    () => ({
      roles: roles.length,
      members: members.length,
      pending: invites.filter((invite) => invite.status === "PENDING").length,
    }),
    [invites, members.length, roles.length]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
            Access
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">
            Role Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Create staff roles, add team accounts, and send Resend email invites.
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Roles", value: stats.roles, icon: Shield },
          { label: "Team members", value: stats.members, icon: Users },
          { label: "Pending invites", value: stats.pending, icon: Mail },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold text-neutral-900">{card.value}</p>
                <p className="text-xs text-neutral-500">{card.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
        {(
          [
            { id: "roles", label: "Roles" },
            { id: "members", label: "Team accounts" },
            { id: "invites", label: "Invites" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors sm:flex-none",
              tab === item.id
                ? "bg-brand-green-600 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
            onClick={() => setTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "roles" ? (
        <RolesTab loading={rolesLoading} mutations={mutations} roles={roles} />
      ) : null}
      {tab === "members" ? (
        <MembersTab loading={membersLoading} members={members} mutations={mutations} roles={roles} />
      ) : null}
      {tab === "invites" ? (
        <InvitesTab
          invites={invites}
          loading={invitesLoading}
          mutations={mutations}
          roles={roles}
        />
      ) : null}
    </div>
  );
}

function RolesTab({
  roles,
  loading,
  mutations,
}: {
  roles: AdminStaffRole[];
  loading: boolean;
  mutations: ReturnType<typeof useRoleMutations>;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accessLevel, setAccessLevel] = useState<"ADMIN" | "SUPPORT">("SUPPORT");

  function handleCreate() {
    startTransition(async () => {
      try {
        await mutations.createRole.mutateAsync({ name, description, accessLevel });
        setName("");
        setDescription("");
        setAccessLevel("SUPPORT");
        await showAdminSuccess("Role created", "You can now assign or invite people to this role.");
      } catch (error) {
        await showAdminError(
          "Could not create role",
          error instanceof Error ? error.message : "Please try again."
        );
      }
    });
  }

  async function handleDelete(role: AdminStaffRole) {
    const confirmed = await confirmAdminAction({
      title: "Delete role?",
      text: `Delete “${role.name}”? Members must be reassigned first.`,
      confirmText: "Delete",
    });
    if (!confirmed) return;
    try {
      await mutations.deleteRole.mutateAsync(role.id);
      await showAdminSuccess("Role deleted", "Custom role removed.");
    } catch (error) {
      await showAdminError(
        "Delete failed",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="h-fit space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-heading text-lg font-bold text-neutral-900">Create role</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Custom labels on top of Admin or Support access.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Role name</span>
          <input
            className={inputClass}
            onChange={(event) => setName(event.target.value)}
            placeholder="Content Manager"
            value={name}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Access level</span>
          <select
            className={inputClass}
            onChange={(event) => setAccessLevel(event.target.value as "ADMIN" | "SUPPORT")}
            value={accessLevel}
          >
            <option value="ADMIN">Admin — full panel</option>
            <option value="SUPPORT">Support — limited access</option>
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Description</span>
          <textarea
            className={cn(inputClass, "min-h-[90px] py-3")}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this role can do…"
            value={description}
          />
        </label>
        <Button
          className="h-11 w-full rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={isPending || name.trim().length < 2}
          onClick={handleCreate}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create role
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-green-600" />
            Loading roles…
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {roles.map((role) => (
              <article key={role.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                <Link className="min-w-0 flex-1" href={`/admin/roles/${role.id}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 transition-colors hover:text-brand-green-700">
                      {role.name}
                    </h3>
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
                    {role.description || "No description"}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {role.memberCount}{" "}
                    {role.accessLevel === "CUSTOMER" ? "customers" : "members"}
                    {role.accessLevel !== "CUSTOMER"
                      ? ` · ${role.permissions?.length ?? 0} modules · ${role.pendingInvites} pending invites`
                      : " · managed in Customers"}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-green-200 px-3 text-xs font-semibold text-brand-green-700 hover:bg-brand-green-100"
                    href={`/admin/roles/${role.id}`}
                  >
                    Manage access
                  </Link>
                  {!role.isSystem ? (
                    <button
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                      onClick={() => void handleDelete(role)}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MembersTab({
  roles,
  members,
  loading,
  mutations,
}: {
  roles: AdminStaffRole[];
  members: Awaited<ReturnType<typeof useStaffMembers>>["data"];
  loading: boolean;
  mutations: ReturnType<typeof useRoleMutations>;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
    password: "",
  });

  const staffRoles = useMemo(
    () => roles.filter((role) => role.accessLevel !== "CUSTOMER"),
    [roles]
  );
  const selectedRoleId = form.roleId || staffRoles[0]?.id || "";

  function handleCreate() {
    startTransition(async () => {
      try {
        await mutations.createAccount.mutateAsync({
          ...form,
          roleId: selectedRoleId,
          phone: form.phone || undefined,
        });
        setForm({ name: "", email: "", phone: "", roleId: "", password: "" });
        await showAdminSuccess("Account created", "Staff member can sign in with this password.");
      } catch (error) {
        await showAdminError(
          "Create failed",
          error instanceof Error ? error.message : "Please try again."
        );
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="h-fit space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-heading text-lg font-bold text-neutral-900">Create account</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Manually create a staff login with a temporary password.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Full name</span>
          <input
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            value={form.name}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Email</span>
          <input
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
            value={form.email}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Phone</span>
          <input
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            value={form.phone}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Role</span>
          <select
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}
            value={selectedRoleId}
          >
            {staffRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.accessLevel})
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Temporary password</span>
          <div className="relative">
            <input
              className={cn(inputClass, "pr-11")}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              type={showPassword ? "text" : "password"}
              value={form.password}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <Button
          className="h-11 w-full rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={isPending || !selectedRoleId}
          onClick={handleCreate}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create account
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-green-600" />
            Loading members…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(members ?? []).map((member) => (
                  <tr key={member.id} className="border-b border-neutral-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-neutral-900">{member.name}</p>
                      <p className="text-xs text-neutral-500">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {member.staffRole?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          member.status === "Active"
                            ? "bg-brand-green-100 text-brand-green-700"
                            : "bg-red-50 text-red-700"
                        )}
                      >
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(members ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-neutral-500" colSpan={4}>
                      No staff accounts yet. Create one or send an invite.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function InvitesTab({
  roles,
  invites,
  loading,
  mutations,
}: {
  roles: AdminStaffRole[];
  invites: Awaited<ReturnType<typeof useStaffInvites>>["data"];
  loading: boolean;
  mutations: ReturnType<typeof useRoleMutations>;
}) {
  const [isPending, startTransition] = useTransition();
  const [lastPreviewUrl, setLastPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", roleId: "" });
  const staffRoles = useMemo(
    () => roles.filter((role) => role.accessLevel !== "CUSTOMER"),
    [roles]
  );
  const selectedRoleId = form.roleId || staffRoles[0]?.id || "";

  function handleInvite() {
    startTransition(async () => {
      try {
        const result = await mutations.inviteStaff.mutateAsync({
          name: form.name,
          email: form.email,
          roleId: selectedRoleId,
        });
        setForm({ name: "", email: "", roleId: "" });
        if (result.previewUrl) setLastPreviewUrl(result.previewUrl);
        if (result.error) {
          await showAdminError("Invite partially sent", result.error);
        } else {
          await showAdminSuccess(
            "Invite sent",
            result.previewUrl && result.previewUrl.includes("localhost")
              ? "Resend is not fully configured — use the invite link below for testing."
              : "Invitation email was sent via Resend."
          );
        }
      } catch (error) {
        await showAdminError(
          "Invite failed",
          error instanceof Error ? error.message : "Please try again."
        );
      }
    });
  }

  async function copyLink() {
    if (!lastPreviewUrl) return;
    await navigator.clipboard.writeText(lastPreviewUrl);
    await showAdminSuccess("Copied", "Invite link copied to clipboard.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="h-fit space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-heading text-lg font-bold text-neutral-900">Send invite</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Emails are sent with Resend. Recipients set their own password.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Name</span>
          <input
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Optional"
            value={form.name}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Email</span>
          <input
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
            value={form.email}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">Role</span>
          <select
            className={inputClass}
            onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}
            value={selectedRoleId}
          >
            {staffRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.accessLevel})
              </option>
            ))}
          </select>
        </label>
        <Button
          className="h-11 w-full rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={isPending || !selectedRoleId || !form.email.trim()}
          onClick={handleInvite}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Send invite
        </Button>

        {lastPreviewUrl ? (
          <div className="rounded-xl border border-brand-green-100 bg-brand-green-100/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-green-800">
              Invite link
            </p>
            <p className="mt-1 break-all text-xs text-neutral-600">{lastPreviewUrl}</p>
            <button
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green-700"
              onClick={() => void copyLink()}
              type="button"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </button>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-green-600" />
            Loading invites…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Invitee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(invites ?? []).map((invite) => (
                  <tr key={invite.id} className="border-b border-neutral-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-neutral-900">
                        {invite.name || invite.email}
                      </p>
                      <p className="text-xs text-neutral-500">{invite.email}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{invite.role.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                        {invite.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {invite.status === "PENDING" ? (
                        <button
                          className="text-xs font-semibold text-red-600 hover:underline"
                          onClick={() => void mutations.revokeInvite.mutateAsync(invite.id)}
                          type="button"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(invites ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-neutral-500" colSpan={5}>
                      No invites yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
