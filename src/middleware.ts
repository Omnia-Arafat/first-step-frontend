import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const validLocales = ["ar", "en"];

  // Redirect www to non-www for canonical URLs (fixes Google duplicate content)
  const hostname = request.headers.get("host") || "";
  if (hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = hostname.replace("www.", "");
    return NextResponse.redirect(url, 301);
  }

  // 0. Redirect old/legacy URLs for SEO
  const legacyRedirects: Record<string, string> = {
    "/about": "/our-story",
    "/terms-of-service": "/terms-conditions",
  };

  // Check if pathname (without locale) is a legacy route
  for (const locale of validLocales) {
    for (const [oldPath, newPath] of Object.entries(legacyRedirects)) {
      if (pathname === `/${locale}${oldPath}`) {
        return NextResponse.redirect(
          new URL(`/${locale}${newPath}`, request.url),
          301,
        );
      }
    }
  }

  // Legacy redirects for old routes
  const generalLegacyRedirects: Record<string, string> = {
    "/nurseries": "/establishments",
    "/centers": "/establishments",
  };

  // Extract path without locale for redirect matching
  // Assuming pathname format: /[locale]/path or /path
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] || "";
  const isFirstSegmentLocale = validLocales.includes(firstSegment);
  const pathWithoutLocale = isFirstSegmentLocale
    ? "/" + pathSegments.slice(1).join("/")
    : pathname;
  const detectedLocale = isFirstSegmentLocale ? firstSegment : "ar"; // default to 'ar'

  // Check for general legacy redirects (e.g., /nurseries -> /establishments)
  if (generalLegacyRedirects[pathWithoutLocale]) {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}${generalLegacyRedirects[pathWithoutLocale]}`;
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // Handle old /nurseries/[name] and /centers/[name] routes
  if (
    pathWithoutLocale.startsWith("/nurseries/") &&
    !pathWithoutLocale.includes("/reservation")
  ) {
    const slug = pathWithoutLocale.replace("/nurseries/", "");
    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}/establishments/nurseries/${slug}`;
    return NextResponse.redirect(url, 301);
  }
  if (pathWithoutLocale.startsWith("/centers/")) {
    const slug = pathWithoutLocale.replace("/centers/", "");
    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}/establishments/centers/${slug}`;
    return NextResponse.redirect(url, 301);
  }

  // Handle bare legacy redirects (without locale prefix)
  if (legacyRedirects[pathname]) {
    // This will let the locale logic below handle adding the locale after redirecting the path
    const url = request.nextUrl.clone();
    url.pathname = legacyRedirects[pathname];
    return NextResponse.redirect(url, 301);
  }

  // 1. Check for existing locale in pathname
  const localeMatch = pathname.match(/^\/(\w+)/);
  const potentialLocale = localeMatch ? localeMatch[1] : null;
  let locale = validLocales.includes(potentialLocale || "")
    ? potentialLocale
    : null;

  // 2. If no valid locale in path, check cookie and redirect
  if (!locale) {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    locale = validLocales.find((l) => l === cookieLocale) || "ar"; // Default to Arabic if no valid cookie
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 3. Persist locale into cookie
  const response = intlMiddleware(request);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // Add pathname to headers for metadata generation
  response.headers.set("x-pathname", pathname);

  // 4. Get auth token
  const token = request.cookies.get("auth-storage")?.value;

  // 5. Redirect authenticated users away from auth pages
  const isAuthRoute =
    pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/otp-verification") ||
    pathname.includes("/reset-password");

  if (isAuthRoute && token) {
    try {
      const authData = JSON.parse(token);
      const user = authData.user;

      if (user && user.role) {
        const url = request.nextUrl.clone();
        // Redirect to appropriate dashboard based on role
        if (user.role === "parent") {
          url.pathname = `/${locale}/dashboard/parent`;
        } else if (user.role === "nursery") {
          url.pathname = `/${locale}/dashboard/nursery`;
        } else if (user.role === "center") {
          url.pathname = `/${locale}/dashboard/center`;
        } else if (user.role === "branch_admin") {
          if (user.center_id) {
            url.pathname = `/${locale}/dashboard/center`;
          } else {
            url.pathname = `/${locale}/dashboard/nursery`;
          }
        } else if (user.role === "admin") {
          url.pathname = `/${locale}/dashboard/admin`;
        } else {
          url.pathname = `/${locale}`;
        }
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Invalid token, allow access to auth pages
      console.error("Error parsing auth token:", error);
    }
  }

  // 6. Dashboard auth & role checks
  const isDashboardRoute = pathname.includes("/dashboard");

  if (isDashboardRoute) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }

    try {
      const authData = JSON.parse(token);
      const user = authData.user;

      if (!user || !user.role) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}`;
        return NextResponse.redirect(url);
      }

      const role = user.role;
      const allowedRoles = [
        "admin",
        "nursery",
        "center",
        "branch_admin",
        "parent",
      ];

      if (!allowedRoles.includes(role)) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}`;
        return NextResponse.redirect(url);
      }

      const parentDashboard = `/${locale}/dashboard/parent`;
      const adminDashboard = `/${locale}/dashboard/admin`;
      const centerDashboard = `/${locale}/dashboard/center`;
      const nurseryDashboard = `/${locale}/dashboard/nursery`;

      if (role === "parent" && !pathname.startsWith(parentDashboard)) {
        const url = request.nextUrl.clone();
        url.pathname = parentDashboard;
        return NextResponse.redirect(url);
      } else if (role === "center" && !pathname.startsWith(centerDashboard)) {
        const url = request.nextUrl.clone();
        url.pathname = centerDashboard;
        return NextResponse.redirect(url);
      } else if (role === "branch_admin") {
        if (user.center_id && !pathname.startsWith(centerDashboard)) {
          const url = request.nextUrl.clone();
          url.pathname = centerDashboard;
          return NextResponse.redirect(url);
        } else if (!user.center_id && !pathname.startsWith(nurseryDashboard)) {
          const url = request.nextUrl.clone();
          url.pathname = nurseryDashboard;
          return NextResponse.redirect(url);
        }
      } else if (role === "admin" && !pathname.startsWith(adminDashboard)) {
        const url = request.nextUrl.clone();
        url.pathname = adminDashboard;
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error parsing auth token:", error);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|monitoring-tune|.*\\..*).*)",
};
