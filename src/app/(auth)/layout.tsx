import { CheckCircle2, Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const trustPoints = [
    "Lab Tested Products",
    "GMP Certified",
    "Trusted by 10,000+ Customers",
    "Science-Backed Formulations",
  ];

  return (
    <div className="min-h-screen bg-white md:grid md:grid-cols-[45%_55%]">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#0b4d3a_0%,#16875d_100%)] p-10 text-white md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute -left-16 -top-14 h-48 w-48 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-56 w-56 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -bottom-20 left-14 h-52 w-52 rounded-full border border-white/20" />

        <div className="relative z-10 mx-auto flex h-full max-w-sm flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
            <Leaf className="h-4 w-4" />
            <span className="font-heading text-sm font-semibold tracking-[0.14em]">WELL HEALTH</span>
          </div>

          <p className="mt-8 text-lg font-medium text-white/90">Better Health, Better Life</p>

          <ul className="mt-6 space-y-3 text-left text-sm text-white/90">
            {trustPoints.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex h-40 w-56 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-medium text-white/80">
            Product Visual
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 md:px-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-end">
            <Link
              className="inline-flex h-9 items-center rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900"
              href="/"
            >
              Home Page
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 text-brand-green-700 md:hidden">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-100">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-semibold tracking-[0.12em]">WELL HEALTH</span>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}
