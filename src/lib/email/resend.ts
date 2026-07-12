import { Resend } from "resend";

function getResendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || key.includes("xxxxxxxx")) {
    return null;
  }
  return new Resend(key);
}

/** Shared Resend client for invites + marketing (null when not configured). */
export function getResendClientSafe() {
  return getResendClient();
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || "Well Health <onboarding@resend.dev>";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export type SendEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
  /** When Resend is not configured, the invite URL is returned for local testing. */
  previewUrl?: string;
};

export async function sendStaffInviteEmail(input: {
  to: string;
  inviteeName?: string | null;
  roleName: string;
  inviteUrl: string;
  invitedByName?: string | null;
}): Promise<SendEmailResult> {
  const subject = `You're invited to Well Health Admin (${input.roleName})`;
  const greeting = input.inviteeName?.trim() ? `Hi ${input.inviteeName.trim()},` : "Hi,";
  const inviter = input.invitedByName?.trim() || "the Well Health team";

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1A1D1F;background:#F7F8F9">
    <div style="background:#0B4D3A;border-radius:16px;padding:20px 24px;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:.8">Well Health Trade International</p>
      <h1 style="margin:8px 0 0;font-size:22px">Staff invitation</h1>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px;margin-top:16px;border:1px solid #e5e7eb">
      <p style="margin:0 0 12px">${greeting}</p>
      <p style="margin:0 0 12px;line-height:1.6;color:#4b5563">
        ${inviter} invited you to join the Well Health admin team as <strong>${input.roleName}</strong>.
      </p>
      <p style="margin:0 0 20px;line-height:1.6;color:#4b5563">
        Click the button below to set your password and activate your account. This link expires in 7 days.
      </p>
      <a href="${input.inviteUrl}" style="display:inline-block;background:#16875D;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">
        Accept invitation
      </a>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#9ca3af">
        If the button doesn't work, copy this link:<br/>
        <span style="color:#16875D;word-break:break-all">${input.inviteUrl}</span>
      </p>
    </div>
  </div>`;

  const resend = getResendClient();
  if (!resend) {
    console.info("[email] Resend not configured. Invite preview:", input.inviteUrl);
    return {
      ok: true,
      previewUrl: input.inviteUrl,
      error: undefined,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.to,
      subject,
      html,
    });

    if (error) {
      return { ok: false, error: error.message, previewUrl: input.inviteUrl };
    }

    return { ok: true, id: data?.id, previewUrl: input.inviteUrl };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send email",
      previewUrl: input.inviteUrl,
    };
  }
}
