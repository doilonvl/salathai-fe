"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  const smoothScrollToTop = () => {
    const start = window.scrollY || document.documentElement.scrollTop;
    const duration = 700; // ms
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      window.scrollTo({ top: start * (1 - eased), behavior: "auto" });
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={smoothScrollToTop}
      className="fixed bottom-6 right-6 z-[95] inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#f6d37f] to-[#e0a24a] text-black shadow-lg shadow-amber-900/25 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e0a24a]"
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
