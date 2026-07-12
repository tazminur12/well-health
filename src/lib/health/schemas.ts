export type HealthStatus = "healthy" | "degraded" | "down" | "not_configured";

export type HealthServiceId =
  | "app"
  | "database"
  | "supabase"
  | "cloudinary"
  | "resend"
  | "sslcommerz"
  | "bkash";

export type HealthServiceResult = {
  id: HealthServiceId;
  name: string;
  description: string;
  status: HealthStatus;
  latencyMs: number | null;
  message: string;
  detail?: string;
  category: "core" | "media" | "comms" | "payments";
};

export type ApiHealthReport = {
  overall: HealthStatus;
  checkedAt: string;
  durationMs: number;
  healthyCount: number;
  totalCount: number;
  services: HealthServiceResult[];
  environment: string;
  appUrl: string;
};
