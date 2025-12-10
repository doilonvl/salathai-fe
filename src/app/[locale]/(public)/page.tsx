"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";
import { LandingReveal } from "@/components/animation/LandingReveal";
import { MarqueeScroller } from "@/components/animation/MarqueeScroller";

export default function HomePage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  return (
    <main className="min-h-screen">
      {/* Landing Reveal */}
      <section>
        <LandingReveal />
      </section>

      {/* Marquee scroller */}
      <section>
        <MarqueeScroller />
      </section>
    </main>
  );
}
