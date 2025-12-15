import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";
import {
  useGetMarqueeImagesQuery,
  useGetMarqueeSlidesQuery,
} from "@/services/api";
import "./MarqueeScroller.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-salathai-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-salathai-display",
  display: "swap",
});

const FALLBACK_MARQUEE_IMAGES = [
  {
    id: "local-marquee-1",
    imageUrl: "/Marquee/img-1.jpg",
    altText: "marquee-1",
    altText_i18n: { vi: "marquee-1", en: "marquee-1" },
    orderIndex: 1,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-2",
    imageUrl: "/Marquee/img-2.jpg",
    altText: "marquee-2",
    altText_i18n: { vi: "marquee-2", en: "marquee-2" },
    orderIndex: 2,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-3",
    imageUrl: "/Marquee/img-3.jpg",
    altText: "marquee-3",
    altText_i18n: { vi: "marquee-3", en: "marquee-3" },
    orderIndex: 3,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-4",
    imageUrl: "/Marquee/img-4.jpg",
    altText: "marquee-4",
    altText_i18n: { vi: "marquee-4", en: "marquee-4" },
    orderIndex: 4,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-5",
    imageUrl: "/Marquee/img-5.jpg",
    altText: "marquee-5",
    altText_i18n: { vi: "marquee-5", en: "marquee-5" },
    orderIndex: 5,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-6",
    imageUrl: "/Marquee/img-6.jpeg",
    altText: "marquee-6",
    altText_i18n: { vi: "marquee-6", en: "marquee-6" },
    orderIndex: 6,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-7",
    imageUrl: "/Marquee/img-7.jpg",
    altText: "marquee-7",
    altText_i18n: { vi: "marquee-7", en: "marquee-7" },
    orderIndex: 7,
    isPinned: true,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-8",
    imageUrl: "/Marquee/img-8.png",
    altText: "marquee-8",
    altText_i18n: { vi: "marquee-8", en: "marquee-8" },
    orderIndex: 8,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-9",
    imageUrl: "/Marquee/img-9.jpg",
    altText: "marquee-9",
    altText_i18n: { vi: "marquee-9", en: "marquee-9" },
    orderIndex: 9,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-10",
    imageUrl: "/Marquee/img-10.jpg",
    altText: "marquee-10",
    altText_i18n: { vi: "marquee-10", en: "marquee-10" },
    orderIndex: 10,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-11",
    imageUrl: "/Marquee/img-11.jpg",
    altText: "marquee-11",
    altText_i18n: { vi: "marquee-11", en: "marquee-11" },
    orderIndex: 11,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-12",
    imageUrl: "/Marquee/img-12.png",
    altText: "marquee-12",
    altText_i18n: { vi: "marquee-12", en: "marquee-12" },
    orderIndex: 12,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "local-marquee-13",
    imageUrl: "/Marquee/img-13.png",
    altText: "marquee-13",
    altText_i18n: { vi: "marquee-13", en: "marquee-13" },
    orderIndex: 13,
    isPinned: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

const FALLBACK_MARQUEE_SLIDES = [
  {
    id: "fallback-slide-1",
    tag: "Warm up",
    tag_i18n: { vi: "Warm up", en: "Warm up" },
    text: "Khai vị nhẹ nhàng để đánh thức vị giác.",
    text_i18n: {
      vi: "Khai vị nhẹ nhàng để đánh thức vị giác.",
      en: "Light starters to wake up your palate.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447128/salathai/marquee-slides/slide-4.jpg",
    orderIndex: 1,
    isActive: true,
    createdAt: "2025-12-11T10:04:16.095Z",
    updatedAt: "2025-12-11T10:04:16.095Z",
  },
  {
    id: "fallback-slide-2",
    tag: "Signature",
    tag_i18n: { vi: "Signature", en: "Signature" },
    text: "Các món signature với hương vị đặc trưng.",
    text_i18n: {
      vi: "Các món signature với hương vị đặc trưng.",
      en: "Signature dishes with our distinctive flavors.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447127/salathai/marquee-slides/slide-1.jpg",
    orderIndex: 2,
    isActive: true,
    createdAt: "2025-12-11T09:59:12.270Z",
    updatedAt: "2025-12-11T10:01:14.865Z",
  },
  {
    id: "fallback-slide-3",
    tag: "Refresh",
    tag_i18n: { vi: "Refresh", en: "Refresh" },
    text: "Món nhẹ, tươi mát cho buổi chiều.",
    text_i18n: {
      vi: "Món nhẹ, tươi mát cho buổi chiều.",
      en: "Light, refreshing bites for the afternoon.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447127/salathai/marquee-slides/slide-2.jpg",
    orderIndex: 3,
    isActive: true,
    createdAt: "2025-12-11T10:02:15.818Z",
    updatedAt: "2025-12-11T10:02:15.818Z",
  },
  {
    id: "fallback-slide-4",
    tag: "Dessert",
    tag_i18n: { vi: "Dessert", en: "Dessert" },
    text: "Kết thúc ngọt ngào với các món tráng miệng.",
    text_i18n: {
      vi: "Kết thúc ngọt ngào với các món tráng miệng.",
      en: "Sweet endings to finish your meal.",
    },
    imageUrl:
      "https://res.cloudinary.com/dz2mipnax/image/upload/v1765447129/salathai/marquee-slides/slide-7.jpg",
    orderIndex: 4,
    isActive: true,
    createdAt: "2025-12-11T10:04:51.284Z",
    updatedAt: "2025-12-11T10:04:51.284Z",
  },
];

function pickLocalized(
  value: { vi?: string; en?: string } | undefined,
  locale: Locale,
  fallback = ""
) {
  if (!value) return fallback;
  if (locale === "en") {
    return value.en || value.vi || fallback;
  }
  return value.vi || value.en || fallback;
}

export function MarqueeScroller() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home.marquee");
  const [isMobile, setIsMobile] = useState(false);
  const { data: marqueeImagesData } = useGetMarqueeImagesQuery();
  const { data: marqueeSlidesData } = useGetMarqueeSlidesQuery();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const marqueeItems = useMemo(() => {
    const items = marqueeImagesData?.items ?? FALLBACK_MARQUEE_IMAGES;
    if (!isMobile) {
      return items.map((item, idx) => ({
        ...item,
        altText: pickLocalized(
          item.altText_i18n,
          locale,
          item.altText || `marquee-${idx + 1}`
        ),
      }));
    }

    const limit = 6;
    const pinIdx = items.findIndex((item) => item.isPinned);
    const centerIdx = pinIdx >= 0 ? pinIdx : 2;

    let subset: typeof items;
    if (items.length <= limit) {
      subset = items;
    } else {
      const half = Math.floor(limit / 2); // 3 when limit=6
      const start = Math.max(
        0,
        Math.min(items.length - limit, centerIdx - (half - 2))
      );
      const end = start + limit;
      subset = items.slice(start, end);
      // Ensure pinned included; if not, append and trim.
      if (pinIdx >= 0 && !subset.some((item) => item.isPinned)) {
        subset = [...subset.slice(0, limit - 1), items[pinIdx]];
      }
    }

    return subset.map((item, idx) => ({
      ...item,
      altText: pickLocalized(
        item.altText_i18n,
        locale,
        item.altText || `marquee-${idx + 1}`
      ),
    }));
  }, [locale, marqueeImagesData]);
  const pinnedIndex = useMemo(() => {
    if (!marqueeItems.length) return -1;
    const idx = marqueeItems.findIndex((item) => item.isPinned);
    if (idx >= 0) return idx;
    return Math.min(6, marqueeItems.length - 1);
  }, [marqueeItems]);
  const slides = useMemo(() => {
    const items = marqueeSlidesData?.items ?? FALLBACK_MARQUEE_SLIDES;
    const localized = items.map((item) => ({
      ...item,
      tag: pickLocalized(item.tag_i18n, locale, item.tag),
      text: pickLocalized(item.text_i18n, locale, item.text),
    }));
    // Đảm bảo tối thiểu 3 slide để layout ổn định kể cả khi admin tắt bớt.
    if (localized.length >= 3) return localized;
    const padded = [...localized];
    let idx = 0;
    while (padded.length < 3 && localized.length > 0) {
      const src = localized[idx % localized.length];
      padded.push({
        ...src,
        id: `${src.id}-dup-${padded.length}`,
        orderIndex: src.orderIndex + padded.length,
      });
      idx++;
    }
    return padded;
  }, [locale, marqueeSlidesData]);
  const totalPanels = slides.length + 1; // spacer + slides
  const maxTranslate =
    totalPanels > 0 ? ((totalPanels - 1) / totalPanels) * 100 : 0; // wrapper shift %
  const maxImageShift = Math.max(totalPanels - 1, 0) * 100; // pinned image shift %
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedCloneRef = useRef<HTMLImageElement | null>(null);
  const flipRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Flip);
    const shell = containerRef.current;
    if (!shell) return;

    const lenis = new Lenis();
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length ? lenis.scrollTo(value ?? 0) : lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? "transform" : "fixed",
    });
    const onTick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const getColor = (name: string) =>
        getComputedStyle(shell).getPropertyValue(name).trim();

      const lightColor = getColor("--wjy-light") || "#edf1e8";
      const darkColor = getColor("--wjy-dark") || "#101010";
      const mix = (c1: string, c2: string, f: number) =>
        gsap.utils.interpolate(c1, c2, f);

      // Marquee subtle drift
      gsap.to(".wjy-marquee-images", {
        scrollTrigger: {
          trigger: ".wjy-marquee",
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: (self) => {
            const xPosition = -75 + self.progress * 25;
            gsap.set(".wjy-marquee-images", { x: `${xPosition}%` });
          },
        },
      });

      const getPinnedImg = () =>
        containerRef.current?.querySelector(
          ".wjy-marquee-img.pin img"
        ) as HTMLImageElement | null;

      const createPinnedClone = () => {
        if (pinnedCloneRef.current) return;
        const original = getPinnedImg();
        if (!original) return;

        const rect = original.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clone = original.cloneNode(true) as HTMLImageElement;
        clone.classList.add("wjy-fixed-clone");

        gsap.set(clone, {
          position: "fixed",
          left: centerX - original.offsetWidth / 2,
          top: centerY - original.offsetHeight / 2,
          width: original.offsetWidth,
          height: original.offsetHeight,
          rotate: "-5deg",
          transformOrigin: "center center",
          zIndex: 100,
          pointerEvents: "none",
        });

        document.body.appendChild(clone);
        gsap.set(original, { opacity: 0 });
        pinnedCloneRef.current = clone;
      };

      const removePinnedClone = () => {
        pinnedCloneRef.current?.remove();
        pinnedCloneRef.current = null;
        const original = getPinnedImg();
        if (original) gsap.set(original, { opacity: 1 });
      };

      // Pin horizontal section
      ScrollTrigger.create({
        trigger: ".wjy-horizontal",
        start: "top top",
        end: () => `+=${window.innerHeight * 5}`,
        pin: true,
      });

      // Clone pin image when entering marquee
      ScrollTrigger.create({
        trigger: ".wjy-marquee",
        start: "top top",
        onEnter: createPinnedClone,
        onEnterBack: createPinnedClone,
        onLeaveBack: removePinnedClone,
      });

      // Prepare Flip
      ScrollTrigger.create({
        trigger: ".wjy-horizontal",
        start: "top 50%",
        end: () => `+=${window.innerHeight * 5.5}`,
        onEnter: () => {
          if (pinnedCloneRef.current && !flipRef.current) {
            const state = Flip.getState(pinnedCloneRef.current);

            gsap.set(pinnedCloneRef.current, {
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: "100svh",
              rotate: 0,
              transformOrigin: "center center",
            });

            flipRef.current = Flip.from(state, {
              duration: 1,
              ease: "none",
              paused: true,
            });
          }
        },
        onLeaveBack: () => {
          flipRef.current?.kill();
          flipRef.current = null;
          gsap.set(shell, { backgroundColor: lightColor });
          gsap.set(".wjy-horizontal-wrapper", { x: "0%" });
        },
      });

      // Drive progress
      ScrollTrigger.create({
        trigger: ".wjy-horizontal",
        start: "top 50%",
        end: () => `+=${window.innerHeight * 5.5}`,
        onUpdate: (self) => {
          const progress = self.progress;
          const horizontalProgressRaw = (progress - 0.2) / 0.75;
          const horizontalProgress = Math.min(
            Math.max(horizontalProgressRaw, 0),
            1
          );

          // Background fade
          if (progress <= 0.05) {
            const newBg = mix(lightColor, darkColor, progress / 0.05);
            gsap.set(shell, { backgroundColor: newBg });
          } else {
            gsap.set(shell, { backgroundColor: darkColor });
          }

          // Flip play
          if (progress <= 0.2) {
            flipRef.current?.progress(progress / 0.2);
          } else if (progress <= 0.95) {
            flipRef.current?.progress(1);
            const wrapperTranslateX = -maxTranslate * horizontalProgress;
            const imageTranslateX = -maxImageShift * horizontalProgress;

            gsap.set(".wjy-horizontal-wrapper", {
              x: `${wrapperTranslateX}%`,
            });
            if (pinnedCloneRef.current) {
              gsap.set(pinnedCloneRef.current, { x: `${imageTranslateX}%` });
            }
          } else {
            flipRef.current?.progress(1);
            if (pinnedCloneRef.current)
              gsap.set(pinnedCloneRef.current, { x: `-${maxImageShift}%` });
            gsap.set(".wjy-horizontal-wrapper", { x: `-${maxTranslate}%` });
          }

          if (progressRef.current) {
            gsap.set(progressRef.current, {
              width: `${horizontalProgress * 100}%`,
            });
          }
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
      pinnedCloneRef.current?.remove();
      flipRef.current?.kill();
    };
  }, [maxImageShift, maxTranslate, marqueeItems.length, slides.length]);

  return (
    <div
      ref={containerRef}
      className={`wjy-shell ${plusJakarta.variable} ${playfair.variable}`}
      style={{
        ["--wjy-light" as string]: "#edf1e8",
        ["--wjy-dark" as string]: "#0e0b09",
      }}
    >
      <section className="wjy-hero">
        <h1>{t("intro")}</h1>
      </section>

      <section className="wjy-marquee">
        <div className="wjy-marquee-wrapper">
          <div className="wjy-marquee-images">
            {marqueeItems.map((item, idx) => (
              <div
                key={item.id}
                className={`wjy-marquee-img${
                  idx === pinnedIndex ? " pin" : ""
                }`}
              >
                <img src={item.imageUrl} alt={item.altText} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wjy-horizontal">
        <div
          className="wjy-horizontal-wrapper"
          style={{
            ["--wjy-slide-count" as string]: totalPanels,
          }}
        >
          <div className="wjy-horizontal-slide wjy-horizontal-spacer" />
          {slides.map((slide, idx) => (
            <div
              key={slide.id ?? slide.imageUrl}
              className="wjy-horizontal-slide"
            >
              <div className="wjy-slide-tag">{slide.tag}</div>
              <div className="col text">
                <h3>{slide.text}</h3>
              </div>
              <div className="col image">
                <img
                  src={slide.imageUrl}
                  alt={slide.tag || `slide-${idx + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="wjy-progress">
          <div ref={progressRef} className="bar" />
        </div>
      </section>

      <section className="wjy-outro">
        <h1>{t("outro")}</h1>
      </section>
    </div>
  );
}

export default MarqueeScroller;
