import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getOrderAccessSecret() {
  const secret = process.env.ORDER_ACCESS_SECRET ?? process.env.CRON_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ORDER_ACCESS_SECRET (or CRON_SECRET) is required in production.");
  }

  return "dev-order-access-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getOrderAccessSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/** Signed, time-limited token for guest order confirmation access. */
export function createOrderAccessToken(orderId: string) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ oid: orderId, exp }), "utf8").toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

export function verifyOrderAccessToken(token: string): { orderId: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, signPayload(payload))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      oid?: string;
      exp?: number;
    };

    if (!parsed.oid || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;

    return { orderId: parsed.oid };
  } catch {
    return null;
  }
}

export function buildGuestOrderSuccessUrl(orderId: string, appUrl: string) {
  const token = createOrderAccessToken(orderId);
  return `${appUrl}/checkout/success?token=${encodeURIComponent(token)}`;
}
