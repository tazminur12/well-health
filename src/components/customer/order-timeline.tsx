import { Check, XCircle } from "lucide-react";

import {
  buildTimeline,
  type CustomerOrder,
} from "@/components/customer/orders-data";
import { cn } from "@/lib/utils";

type OrderTimelineProps = {
  order: CustomerOrder;
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-red-700">Order Cancelled</p>
          <p className="mt-0.5 text-sm text-red-600/90">
            {order.cancelReason ?? "This order was cancelled."}
          </p>
        </div>
      </div>
    );
  }

  const steps = buildTimeline(order);

  return (
    <ol className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const completed = step.state === "completed";
        const current = step.state === "current";

        return (
          <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5",
                  completed ? "bg-brand-green-600" : "bg-neutral-200"
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                completed && "bg-brand-green-600 text-white",
                current && "border-2 border-brand-green-600 bg-brand-green-100 text-brand-green-600",
                step.state === "upcoming" && "border-2 border-neutral-300 bg-white text-neutral-300"
              )}
            >
              {current ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green-600/30" />
              ) : null}
              {completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    current ? "bg-brand-green-600" : "bg-neutral-300"
                  )}
                />
              )}
            </span>

            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.state === "upcoming" ? "text-neutral-400" : "text-neutral-900"
                )}
              >
                {step.label}
              </p>
              {step.timestamp ? (
                <p className="mt-0.5 text-xs text-neutral-500">{step.timestamp}</p>
              ) : (
                <p className="mt-0.5 text-xs text-neutral-400">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
