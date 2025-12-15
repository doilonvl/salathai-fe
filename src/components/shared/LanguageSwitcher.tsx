/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/request";
import { Globe, Check, ChevronDown } from "lucide-react";

type QueryObject = Record<string, string | string[]>;
const SUPPORTED_LOCALES: Locale[] = ["vi", "en"];

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [hash, setHash] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash || "");
  }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preserve all search params when switching locale
  const queryObject = useMemo<QueryObject | undefined>(() => {
    if (!searchParams) return undefined;
    const entries = Array.from(searchParams.entries());
    if (entries.length === 0) return undefined;
    return entries.reduce<QueryObject>((acc, [key, value]) => {
      const existing = acc[key];
      if (!existing) {
        acc[key] = value;
      } else if (Array.isArray(existing)) {
        acc[key] = [...existing, value];
      } else {
        acc[key] = [existing, value];
      }
      return acc;
    }, {});
  }, [searchParams]);

  const goLocale = (target: Locale) => {
    if (target === locale) return;

    const hrefBase = { pathname };
    const hrefWithQuery = queryObject
      ? { ...hrefBase, query: queryObject }
      : hrefBase;

    router.replace(hrefWithQuery as any, { locale: target });

    // Restore hash (anchors) after locale change
    if (hash) {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.hash = hash;
        }
      }, 0);
    }
    setIsOpen(false);
  };

  const flagByLocale: Record<Locale, { label: string; flag: string }> = {
    vi: { label: "Tiếng Việt", flag: "/Flag/vn.png" },
    en: { label: "English", flag: "/Flag/usa.png" },
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`nav-pill flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10 ${
          className ?? ""
        }`}
        aria-label={t("ariaLabel")}
      >
        <Globe className="h-4 w-4" />
        <span className="flex items-center gap-1.5">
          <img
            src={flagByLocale[locale]?.flag}
            alt={flagByLocale[locale]?.label}
            className="h-4 w-6 rounded-[3px] object-cover"
            loading="lazy"
            style={{ width: "1.5rem", height: "1rem" }}
          />
          <span className="font-semibold leading-none">
            {flagByLocale[locale]?.label}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 opacity-75" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-lg border border-black/10 bg-white text-sm text-neutral-900 shadow-xl backdrop-blur">
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => goLocale(code)}
              className={`flex w-full items-center cursor-pointer justify-between px-3 py-2 text-left transition hover:bg-black/5 ${
                locale === code ? "bg-black/5 font-semibold" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <img
                  src={flagByLocale[code]?.flag}
                  alt={flagByLocale[code]?.label}
                  className="h-4 w-6 rounded-[3px] object-cover"
                  loading="lazy"
                  style={{ width: "1.5rem", height: "1rem" }}
                />
                <span className="text-xs font-semibold uppercase">{code}</span>
              </span>
              {locale === code ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
