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

export function middleware(req: NextRequest) {
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
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
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
