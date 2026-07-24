/** Client-safe Steadfast display helpers (no secrets). */

export function buildSteadfastTrackingUrl(trackingCode: string) {
  const code = trackingCode.trim();
  if (!code) return null;
  const template =
    process.env.NEXT_PUBLIC_STEADFAST_TRACKING_URL?.trim() ||
    process.env.STEADFAST_TRACKING_URL?.trim() ||
    "https://steadfast.com.bd/t/{code}";
  return template.replace("{code}", encodeURIComponent(code));
}

export function formatSteadfastStatusLabel(status: string | null | undefined) {
  if (!status) return "—";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
