/* eslint-disable @typescript-eslint/no-explicit-any */
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/request";
import { pathnames } from "@/i18n/navigation";

const intl = createMiddleware({
  locales: [...locales],
  defaultLocale,
  pathnames,
  localePrefix: "as-needed",
  // Force default locale when no explicit selection; avoid Accept-Language choosing English first.
  localeDetection: false,
});

export async function middleware(req: NextRequest) {
  const res = intl(req);
  if (!req.cookies.get("NEXT_LOCALE")) {
    res.cookies.set("NEXT_LOCALE", defaultLocale, {
      path: "/",
      sameSite: "lax",
    });
  }

  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/(?:(vi|en)\/)?admin(\/|$)/);
  if (match) {
    const locale = (match[1] as "vi" | "en") ?? defaultLocale;
    const accessToken =
      req.cookies.get("access_token")?.value ||
      req.cookies.get("access_token_public")?.value;
    const refreshToken =
      req.cookies.get("refresh_token")?.value ||
      req.cookies.get("refresh_token_public")?.value;

    // Try to refresh on the server if access is missing but refresh is present
    if (!accessToken && refreshToken) {
      try {
        const refreshRes = await fetch(
          `${req.nextUrl.origin}/api/auth/refresh`,
          {
            method: "POST",
            // Forward all cookies so BE can validate refresh in any format.
            headers: {
              cookie: req.headers.get("cookie") ?? "",
            },
          }
        );

        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => null);
          const newAccess =
            (data as any)?.accessToken ||
            (data as any)?.access_token ||
            (data as any)?.token;
          const newRefresh =
            (data as any)?.refreshToken ||
            (data as any)?.refresh_token ||
            (data as any)?.refresh ||
            refreshToken;

          if (newAccess) {
            const isProd = process.env.NODE_ENV === "production";
            res.cookies.set("access_token", newAccess, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 15,
            });
            res.cookies.set("access_token_public", newAccess, {
              httpOnly: false,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 15,
            });
            res.cookies.set("refresh_token", newRefresh, {
              httpOnly: true,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });
            res.cookies.set("refresh_token_public", newRefresh, {
              httpOnly: false,
              secure: isProd,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });
            return res;
          }
        }
      } catch (err) {
        // swallow and redirect to login below
      }
    }

    // Redirect only when neither access nor refresh is available or refresh failed
    if (!accessToken && !refreshToken) {
      const url = req.nextUrl.clone();
      const loginPath =
        locale === defaultLocale ? "/login" : `/${locale}/login`;
      url.pathname = loginPath;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
