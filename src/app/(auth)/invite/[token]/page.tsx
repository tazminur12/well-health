"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { showAuthError, showAuthSuccess } from "@/lib/auth/alerts";
import { acceptStaffInviteAction, getInviteByTokenAction } from "@/lib/roles/actions";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<{
    email: string;
    name: string;
    roleName: string;
    expiresAt: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await getInviteByTokenAction(token);
      if (!active) return;
      if (result.error || !result.data) {
        setError(result.error ?? "Invalid invite");
        setLoading(false);
        return;
      }
      setInvite(result.data);
      setForm((current) => ({ ...current, name: result.data?.name || "" }));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [token]);

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptStaffInviteAction({
        token,
        name: form.name,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (result.error || !result.data) {
        await showAuthError("Could not activate account", result.error ?? "Please try again.");
        return;
      }
      await showAuthSuccess("Welcome aboard", "Your account is ready. Please sign in.");
      router.push(`/login?next=${encodeURIComponent(result.data.redirectTo)}`);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-green-600" />
        Checking invitation…
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Invite unavailable</h1>
        <p className="mt-2 text-sm text-neutral-500">{error}</p>
        <Link className="mt-6 text-sm font-semibold text-brand-green-600 hover:underline" href="/login">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green-600">
              Staff invite
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">
              Join as {invite.roleName}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {invite.email} · expires {new Date(invite.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Full name</span>
            <input
              className={inputClass}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Password</span>
            <input
              className={inputClass}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              type="password"
              value={form.password}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Confirm password</span>
            <input
              className={inputClass}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              type="password"
              value={form.confirmPassword}
            />
          </label>

          <Button
            className={cn(
              "h-11 w-full rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
            )}
            disabled={isPending}
            onClick={handleAccept}
            type="button"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Activate account
          </Button>
        </div>
      </div>
    </div>
  );
}
