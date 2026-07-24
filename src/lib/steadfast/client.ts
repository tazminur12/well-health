/**
 * Steadfast Courier (Packzy) API client.
 * Docs: https://docs.google.com/document/d/e/2PACX-1vTi0sTyR353xu1AK0nR8E_WKe5onCkUXGEf8ch8uoJy9qxGfgGnboSIkNosjQ0OOdXkJhgGuAsWxnIh/pub
 *
 * Env:
 *   STEADFAST_API_KEY=
 *   STEADFAST_SECRET_KEY=
 *   STEADFAST_BASE_URL=   (optional, default https://portal.packzy.com/api/v1)
 */

export const STEADFAST_DEFAULT_BASE_URL = "https://portal.packzy.com/api/v1";

export const STEADFAST_DELIVERY_STATUSES = [
  "pending",
  "delivered_approval_pending",
  "partial_delivered_approval_pending",
  "cancelled_approval_pending",
  "unknown_approval_pending",
  "delivered",
  "partial_delivered",
  "cancelled",
  "hold",
  "in_review",
  "unknown",
] as const;

export type SteadfastDeliveryStatus = (typeof STEADFAST_DELIVERY_STATUSES)[number] | string;

export type SteadfastConsignment = {
  consignment_id: number;
  invoice: string;
  tracking_code: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  status: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SteadfastCreateOrderInput = {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  alternative_phone?: string;
  recipient_email?: string;
  note?: string;
  item_description?: string;
  total_lot?: number;
  /** 0 = home delivery, 1 = point / hub pickup */
  delivery_type?: 0 | 1;
};

export type SteadfastApiResult<T> =
  | { ok: true; data: T; latencyMs: number }
  | { ok: false; error: string; latencyMs: number; statusCode?: number };

function getBaseUrl() {
  return (process.env.STEADFAST_BASE_URL?.trim() || STEADFAST_DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function isSteadfastConfigured() {
  const apiKey = process.env.STEADFAST_API_KEY?.trim() ?? "";
  const secret = process.env.STEADFAST_SECRET_KEY?.trim() ?? "";
  return Boolean(
    apiKey &&
      secret &&
      !apiKey.includes("xxxxxxxx") &&
      !secret.includes("xxxxxxxx")
  );
}

export function getSteadfastConfigStatus() {
  return {
    configured: isSteadfastConfigured(),
    baseUrl: getBaseUrl(),
    hasApiKey: Boolean(process.env.STEADFAST_API_KEY?.trim()),
    hasSecretKey: Boolean(process.env.STEADFAST_SECRET_KEY?.trim()),
  };
}

/** Normalize to Steadfast 11-digit local format (01XXXXXXXXX). */
export function normalizeSteadfastPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 11 && digits.startsWith("01")) return digits;
  if (digits.length === 13 && digits.startsWith("8801")) return `0${digits.slice(3)}`;
  if (digits.length === 10 && digits.startsWith("1")) return `0${digits}`;
  return null;
}

async function steadfastRequest<T>(
  path: string,
  init?: RequestInit
): Promise<SteadfastApiResult<T>> {
  if (!isSteadfastConfigured()) {
    return {
      ok: false,
      latencyMs: 0,
      error:
        "Steadfast is not configured. Add STEADFAST_API_KEY and STEADFAST_SECRET_KEY to .env.",
    };
  }

  const started = Date.now();
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Api-Key": process.env.STEADFAST_API_KEY!.trim(),
        "Secret-Key": process.env.STEADFAST_SECRET_KEY!.trim(),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const latencyMs = Date.now() - started;
    const text = await response.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        latencyMs,
        statusCode: response.status,
        error: `Invalid JSON from Steadfast (HTTP ${response.status}).`,
      };
    }

    if (!response.ok) {
      const message =
        typeof json === "object" &&
        json &&
        "message" in json &&
        typeof (json as { message: unknown }).message === "string"
          ? (json as { message: string }).message
          : `Steadfast request failed (HTTP ${response.status}).`;
      return { ok: false, latencyMs, statusCode: response.status, error: message };
    }

    return { ok: true, data: json as T, latencyMs };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : "Steadfast request failed.",
    };
  }
}

type CreateOrderResponse = {
  status?: number;
  message?: string;
  consignment?: SteadfastConsignment;
  errors?: unknown;
};

export async function createSteadfastOrder(
  input: SteadfastCreateOrderInput
): Promise<SteadfastApiResult<SteadfastConsignment>> {
  const result = await steadfastRequest<CreateOrderResponse>("/create_order", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.ok) return result;

  const consignment = result.data.consignment;
  if (!consignment?.consignment_id || !consignment.tracking_code) {
    const message =
      result.data.message ||
      (typeof result.data.errors === "string"
        ? result.data.errors
        : "Steadfast did not return a consignment.");
    return { ok: false, latencyMs: result.latencyMs, error: message };
  }

  return { ok: true, data: consignment, latencyMs: result.latencyMs };
}

type StatusResponse = {
  status?: number;
  delivery_status?: string;
  message?: string;
};

export async function getSteadfastStatusByCid(
  consignmentId: number
): Promise<SteadfastApiResult<{ delivery_status: string }>> {
  const result = await steadfastRequest<StatusResponse>(`/status_by_cid/${consignmentId}`);
  if (!result.ok) return result;
  if (!result.data.delivery_status) {
    return {
      ok: false,
      latencyMs: result.latencyMs,
      error: result.data.message || "No delivery status returned.",
    };
  }
  return {
    ok: true,
    data: { delivery_status: result.data.delivery_status },
    latencyMs: result.latencyMs,
  };
}

export async function getSteadfastStatusByInvoice(
  invoice: string
): Promise<SteadfastApiResult<{ delivery_status: string }>> {
  const result = await steadfastRequest<StatusResponse>(
    `/status_by_invoice/${encodeURIComponent(invoice)}`
  );
  if (!result.ok) return result;
  if (!result.data.delivery_status) {
    return {
      ok: false,
      latencyMs: result.latencyMs,
      error: result.data.message || "No delivery status returned.",
    };
  }
  return {
    ok: true,
    data: { delivery_status: result.data.delivery_status },
    latencyMs: result.latencyMs,
  };
}

export async function getSteadfastStatusByTracking(
  trackingCode: string
): Promise<SteadfastApiResult<{ delivery_status: string }>> {
  const result = await steadfastRequest<StatusResponse>(
    `/status_by_trackingcode/${encodeURIComponent(trackingCode)}`
  );
  if (!result.ok) return result;
  if (!result.data.delivery_status) {
    return {
      ok: false,
      latencyMs: result.latencyMs,
      error: result.data.message || "No delivery status returned.",
    };
  }
  return {
    ok: true,
    data: { delivery_status: result.data.delivery_status },
    latencyMs: result.latencyMs,
  };
}

type BalanceResponse = {
  status?: number;
  current_balance?: number;
  message?: string;
};

export async function getSteadfastBalance(): Promise<
  SteadfastApiResult<{ current_balance: number }>
> {
  const result = await steadfastRequest<BalanceResponse>("/get_balance");
  if (!result.ok) return result;
  if (typeof result.data.current_balance !== "number") {
    return {
      ok: false,
      latencyMs: result.latencyMs,
      error: result.data.message || "Balance not returned.",
    };
  }
  return {
    ok: true,
    data: { current_balance: result.data.current_balance },
    latencyMs: result.latencyMs,
  };
}

export async function createSteadfastReturnRequest(input: {
  consignment_id?: number;
  invoice?: string;
  tracking_code?: string;
  reason?: string;
}): Promise<SteadfastApiResult<unknown>> {
  return steadfastRequest("/create_return_request", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listSteadfastPayments(): Promise<SteadfastApiResult<unknown>> {
  return steadfastRequest("/payments");
}

export async function listSteadfastPoliceStations(): Promise<SteadfastApiResult<unknown>> {
  return steadfastRequest("/police_stations");
}
