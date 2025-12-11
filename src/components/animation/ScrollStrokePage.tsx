/* eslint-disable @next/next/no-img-element */
// src/app/components/ScrollStrokePage.tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = { className?: string };

export default function ScrollStrokePage({ className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const t = useTranslations("home.scrollStroke");

  // Keep a Lenis instance to sync with ScrollTrigger updates
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      if (!lenis) return;

      // Let ScrollTrigger use Lenis as scroller
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (typeof value === "number") {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll || window.scrollY;
        },
        getBoundingClientRect: () => ({
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }),
        pinType: document.documentElement.style.transform
          ? "transform"
          : "fixed",
      });

      const onRefresh = () => lenis.resize();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.refresh();

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
      };
    },
    { dependencies: [lenis] }
  );

  useGSAP(
    () => {
      const path = pathRef.current;
      if (!path) return;

      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".spotlight",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          scroller: document.documentElement,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: containerRef, dependencies: [lenis] }
  );

  return (
    <div ref={containerRef} className={className}>
      <ReactLenis root>
        <section className="spotlight relative flex w-full flex-col gap-40 overflow-hidden px-8 py-8">
          <div className="row mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row">
            <div className="img mx-auto w-full max-w-4xl lg:w-2/3">
              <img
                src="/StrokeSVG/img_1.png"
                alt={t("img1Alt")}
                className="mx-auto h-auto w-full max-w-[clamp(220px,48vw,520px)] object-cover"
              />
            </div>
          </div>

          <div className="row flex flex-col items-center justify-center gap-8 lg:flex-row">
            <div className="col flex w-full flex-1 flex-col justify-center">
              <div className="card mx-auto flex w-full flex-col gap-4 rounded-2xl bg-[var(--base-200)] p-12 lg:w-3/4">
                <h2 className="text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl md:tracking-[-0.075rem]">
                  {t("card1Title")}
                </h2>
                <p className="text-base font-medium md:text-lg">
                  {t("card1Body")}
                </p>
              </div>
            </div>
            <div className="col flex w-full flex-1 flex-col justify-center">
              <div className="img">
                <img
                  src="/StrokeSVG/img_2.png"
                  alt={t("img2Alt")}
                  className="mx-auto h-auto w-full max-w-[clamp(240px,48vw,540px)] object-cover"
                />
              </div>
            </div>
          </div>

          <div className="row flex flex-col items-center justify-center gap-8 lg:flex-row">
            <div className="col flex w-full flex-1 flex-col justify-center">
              <div className="img">
                <img
                  src="/StrokeSVG/img_3.png"
                  alt={t("img3Alt")}
                  className="mx-auto h-auto w-full max-w-[clamp(240px,46vw,500px)] object-cover"
                />
              </div>
            </div>
            <div className="col flex w-full flex-1 flex-col justify-center">
              <div className="card mx-auto flex w-full flex-col gap-4 rounded-2xl bg-[var(--base-200)] p-12 lg:w-3/4">
                <h2 className="text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl md:tracking-[-0.075rem]">
                  {t("card2Title")}
                </h2>
                <p className="text-base font-medium md:text-lg">
                  {t("card2Body")}
                </p>
              </div>
            </div>
          </div>

          <div className="row mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:translate-y-[clamp(32px,7vw,88px)]">
            <div className="img mx-auto w-full max-w-4xl lg:w-2/3 lg:translate-x-[clamp(16px,6vw,80px)]">
              <img
                src="/StrokeSVG/img_4.svg"
                alt={t("img4Alt")}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="svg-path pointer-events-none absolute left-1/2 top-[15svh] h-[112%] w-[180%] -translate-x-1/2 -z-10 lg:top-[25svh] lg:h-[108%] lg:w-[80%]">
            <svg
              viewBox="0 0 1378 2760"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMin meet"
              className="h-auto w-full"
            >
              <path
                ref={pathRef}
                id="stroke-path"
                d="M639.668 100C639.668 100 105.669 100 199.669 601.503C293.669 1103.01 1277.17 691.502 1277.17 1399.5C1277.17 2107.5 -155.332 1968 140.168 1438.5C435.669 909.002 1442.66 2093.5 713.168 2659.5"
                stroke="#FF5F0A"
                strokeWidth="140"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </section>
      </ReactLenis>
    </div>
  );
}
