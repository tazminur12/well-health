import { getEmailFrom, getResendClientSafe } from "@/lib/email/resend";

export { getEmailFrom };

export async function sendMarketingEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; error?: string; preview?: boolean }> {
  const resend = getResendClientSafe();
  if (!resend) {
    console.info("[marketing-email] Resend not configured. Preview to:", input.to, input.subject);
    return { ok: true, preview: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export function wrapMarketingEmailHtml(body: string, campaignName: string) {
  const paragraphs = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 12px;line-height:1.6;color:#4b5563">${escapeHtml(line)}</p>`
    )
    .join("");

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1A1D1F;background:#F7F8F9">
    <div style="background:#0B4D3A;border-radius:16px;padding:20px 24px;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:.8">Well Health Trade International</p>
      <h1 style="margin:8px 0 0;font-size:20px">${escapeHtml(campaignName)}</h1>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px;margin-top:16px;border:1px solid #e5e7eb">
      ${paragraphs || `<p style="margin:0;color:#4b5563">${escapeHtml(body)}</p>`}
    </div>
    <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#9ca3af;text-align:center">
      You’re receiving this because you shop with Well Health.
    </p>
  </div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
