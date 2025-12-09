"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";

export default function HomePage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  return (
    <main className="min-h-screen">
      <h1>{t("welcome", { locale })}</h1>
    </main>
  );
}
