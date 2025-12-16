import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./request";

export const pathnames = {
  "/": "/",
  "/admin": {
    vi: "/admin",
    en: "/admin",
  },
  "/admin/landing-menu": {
    vi: "/admin/thuc-don",
    en: "/admin/landing-menu",
  },
  "/admin/marquee-slides": {
    vi: "/admin/marquee-slides",
    en: "/admin/marquee-slides",
  },
} as const;

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    pathnames,
    localePrefix: "as-needed",
  });
