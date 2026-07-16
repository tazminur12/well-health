export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatEmailMoney(value: number) {
  return `৳ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type EmailLayoutInput = {
  storeName: string;
  title: string;
  preheader?: string;
  bodyHtml: string;
  footerNote?: string;
};

export function renderEmailLayout({
  storeName,
  title,
  preheader,
  bodyHtml,
  footerNote,
}: EmailLayoutInput) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1A1D1F;background:#F7F8F9">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ""}
    <div style="background:linear-gradient(135deg,#0B4D3A,#16875D);border-radius:16px;padding:22px 24px;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:.85">${escapeHtml(storeName)}</p>
      <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3">${escapeHtml(title)}</h1>
    </div>
    <div style="background:#fff;border-radius:16px;padding:24px;margin-top:16px;border:1px solid #e5e7eb">
      ${bodyHtml}
    </div>
    <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#9ca3af;text-align:center">
      ${escapeHtml(footerNote ?? `${storeName} · Clinical premium supplements`)}
    </p>
  </div>`;
}

export function isValidEmail(value?: string | null) {
  const email = value?.trim();
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
