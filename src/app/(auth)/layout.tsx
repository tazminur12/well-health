import { CheckCircle2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

const trustPoints = [
  "Lab-tested formulations",
  "GMP-aligned manufacturing",
  "Trusted by 10,000+ customers",
  "Science-backed daily wellness",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8F9] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#0B4D3A_0%,#16875D_55%,#0B4D3A_100%)]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at 80% 70%, rgba(201,162,75,0.22), transparent 40%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <BrandLogo size="lg" tone="dark" variant="full" />

          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                Clinical Premium
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Better Health,
                <span className="block text-[#E8F5EE]">Better Life</span>
              </h1>
              <p className="text-base leading-7 text-white/75">
                Sign in to manage orders, wishlist, and personalized wellness recommendations.
              </p>
            </div>

            <ul className="space-y-3">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C9A24B]" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[16/10]">
                <Image
                  alt="Wellness supplements"
                  className="object-cover opacity-90"
                  fill
                  sizes="(max-width: 1280px) 45vw, 520px"
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B4D3A]/70 to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
                  Premium supplements crafted for everyday wellbeing.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Well Health Trade International
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,135,93,0.08),_transparent_45%)]"
        />

        <div className="relative w-full max-w-[420px] space-y-6">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo className="lg:invisible" size="sm" variant="lockup" />

            <Link
              className="inline-flex min-h-10 items-center rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-600 shadow-sm transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50 hover:text-neutral-900"
              href="/"
            >
              Back to Home
            </Link>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(11,77,58,0.06)] sm:p-7">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
