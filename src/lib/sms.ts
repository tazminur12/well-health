/**
 * SMS provider abstraction for Well Health marketing & transactional SMS.
 *
 * Configure later via .env (not required yet):
 *   SMS_PROVIDER=sslwireless | bulksmsbd | twilio
 *   SMS_API_KEY=
 *   SMS_API_SECRET=
 *   SMS_SENDER_ID=
 *   SMS_API_URL=   (optional override)
 */

export type SmsSendResult = {
  ok: boolean;
  id?: string;
  error?: string;
  configured: boolean;
};

export function isSmsConfigured() {
  const key = process.env.SMS_API_KEY?.trim();
  const sender = process.env.SMS_SENDER_ID?.trim();
  return Boolean(key && sender && !key.includes("xxxxxxxx"));
}

export function getSmsConfigStatus() {
  return {
    configured: isSmsConfigured(),
    provider: process.env.SMS_PROVIDER?.trim() || null,
    senderId: process.env.SMS_SENDER_ID?.trim() || null,
  };
}

/** Normalize BD numbers to 8801XXXXXXXXX when possible. */
export function normalizeBdPhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (digits.startsWith("880") && digits.length >= 13) return digits.slice(0, 13);
  if (digits.startsWith("01") && digits.length === 11) return `880${digits.slice(1)}`;
  if (digits.startsWith("1") && digits.length === 10) return `880${digits}`;
  return digits;
}

export async function sendSms(input: {
  to: string;
  message: string;
}): Promise<SmsSendResult> {
  if (!isSmsConfigured()) {
    return {
      ok: false,
      configured: false,
      error:
        "SMS provider is not configured yet. Add SMS_API_KEY and SMS_SENDER_ID to .env, then try again.",
    };
  }

  const provider = (process.env.SMS_PROVIDER?.trim() || "generic").toLowerCase();
  const to = normalizeBdPhone(input.to);
  const message = input.message.trim();

  if (!to || message.length < 1) {
    return { ok: false, configured: true, error: "Phone number and message are required." };
  }

  // Provider adapters will be wired when credentials are added.
  console.info(`[sms] Would send via ${provider} to ${to}:`, message.slice(0, 80));

  return {
    ok: false,
    configured: true,
    error: `SMS provider "${provider}" adapter is not implemented yet. Credentials detected — wire the API next.`,
  };
}

export async function sendSmsBatch(input: {
  recipients: string[];
  message: string;
}): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const errors: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const raw of input.recipients) {
    const result = await sendSms({ to: raw, message: input.message });
    if (result.ok) successCount += 1;
    else {
      failureCount += 1;
      if (result.error && errors.length < 5) errors.push(result.error);
      // Stop early if provider is not configured — same error for every row
      if (!result.configured) break;
    }
  }

  return { successCount, failureCount, errors };
}
