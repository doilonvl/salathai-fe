/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

type Props = { children: React.ReactNode };

export default function LenisScrollTriggerProvider({ children }: Props) {
  const lenis = useLenis();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!lenis) return;

    const scroller = document.documentElement;

    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll ?? window.scrollY;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType:
        getComputedStyle(scroller).transform !== "none" ? "transform" : "fixed",
    });

    ScrollTrigger.defaults({ scroller });

    const onLenisScroll = () => ScrollTrigger.update();
    const onRefresh = () => lenis.resize();
    lenis.on("scroll", onLenisScroll);
    ScrollTrigger.addEventListener("refresh", onRefresh);

    setReady(true);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onLenisScroll);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      setReady(false);
    };
  }, [lenis]);

  if (!ready) return null;

  return <>{children}</>;
}
