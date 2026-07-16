import { getEmailFrom, getResendClientSafe } from "@/lib/email/resend";
import {
  buildDistributorApprovalLetterPdf,
  buildDistributorReference,
} from "@/lib/distributors/approval-letter-pdf";
import type { AdminDistributorApplication } from "@/lib/distributors/schemas";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

export type SendDistributorApprovalEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
  preview?: boolean;
  reference?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendDistributorApprovalEmail(
  application: AdminDistributorApplication
): Promise<SendDistributorApprovalEmailResult> {
  const store = await getPublicStoreSettings();
  const { filename, base64, reference } = buildDistributorApprovalLetterPdf({
    application,
    store,
  });

  const subject = `Partnership Approved — ${store.storeName} (${reference})`;
  const greeting = application.fullName.trim()
    ? `Dear ${escapeHtml(application.fullName.trim())},`
    : "Dear Partner,";

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1A1D1F;background:#F7F8F9">
    <div style="background:linear-gradient(135deg,#0B4D3A,#16875D);border-radius:16px;padding:22px 24px;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:.85">Well Health Trade International</p>
      <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3">Distributor partnership approved</h1>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px;margin-top:16px;border:1px solid #e5e7eb">
      <p style="margin:0 0 14px">${greeting}</p>
      <p style="margin:0 0 14px;line-height:1.65;color:#4b5563">
        Congratulations! Your application to become an authorized distributor has been <strong style="color:#16875D">approved</strong>.
      </p>
      <p style="margin:0 0 14px;line-height:1.65;color:#4b5563">
        Please find your official <strong>Approval Letter</strong> attached as a PDF for your records.
        Reference: <strong>${escapeHtml(reference)}</strong>
      </p>
      <div style="background:#E8F5EE;border-radius:12px;padding:14px 16px;margin:0 0 16px">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0B4D3A;text-transform:uppercase;letter-spacing:0.08em">Approved territory</p>
        <p style="margin:0;line-height:1.55;color:#1A1D1F">
          <strong>${escapeHtml(application.district)}</strong>, ${escapeHtml(application.division)}<br/>
          Coverage: ${escapeHtml(application.coverageArea)}
        </p>
      </div>
      <p style="margin:0 0 14px;line-height:1.65;color:#4b5563">
        Our partnership team will contact you shortly regarding onboarding, product access, pricing, and order coordination.
      </p>
      <p style="margin:0;line-height:1.65;color:#4b5563">
        For support, reach us at
        <a href="mailto:${escapeHtml(store.supportEmail)}" style="color:#16875D;text-decoration:none;font-weight:600">${escapeHtml(store.supportEmail)}</a>
        or call <strong>${escapeHtml(store.supportPhone)}</strong>.
      </p>
    </div>
    <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#9ca3af;text-align:center">
      ${escapeHtml(store.storeName)} · Clinical premium supplements
    </p>
  </div>`;

  const resend = getResendClientSafe();
  if (!resend) {
    console.info(
      "[distributor-email] Resend not configured. Approval preview:",
      application.email,
      reference
    );
    return { ok: true, preview: true, reference };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: application.email,
      subject,
      html,
      attachments: [
        {
          filename,
          content: base64,
        },
      ],
    });

    if (error) {
      return { ok: false, error: error.message, reference };
    }

    return { ok: true, id: data?.id, reference };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send approval email",
      reference,
    };
  }
}

export { buildDistributorReference };
