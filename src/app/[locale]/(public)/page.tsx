"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";
import { LandingReveal } from "@/components/animation/LandingReveal";
import { MarqueeScroller } from "@/components/animation/MarqueeScroller";
import ScrollStrokePage from "@/components/animation/ScrollStrokePage";
import { ReservationForm } from "@/components/shared/reservation-form";

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

      {/* Stroke svg */}
      <section>
        <ScrollStrokePage />
      </section>

      {/* Reservation form */}
      <section className="mb-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-0">
        <div className="w-full max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto">
          <ReservationForm />
        </div>
      </section>
    </main>
  );
}
