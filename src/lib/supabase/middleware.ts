import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedCustomerRoutes = [
  "/dashboard",
  "/orders",
  "/wishlist",
  "/profile",
  "/messages",
];

const authRoutes = ["/login", "/register", "/forgot-password"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isCustomerProtected = startsWithAny(pathname, protectedCustomerRoutes);
  const isAuthRoute = startsWithAny(pathname, authRoutes);

  if ((isCustomerProtected || isAdminRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const role = String(user.user_metadata?.role ?? "CUSTOMER").toUpperCase();
    const url = request.nextUrl.clone();
    url.pathname = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && user) {
    const role = String(user.user_metadata?.role ?? "CUSTOMER").toUpperCase();
    if (role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
