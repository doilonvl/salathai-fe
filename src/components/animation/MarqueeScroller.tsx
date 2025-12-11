import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
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

const marqueeImages = [
  "/Marquee/img-1.jpg",
  "/Marquee/img-2.jpg",
  "/Marquee/img-3.jpg",
  "/Marquee/img-4.jpg",
  "/Marquee/img-5.jpg",
  "/Marquee/img-6.jpg",
  "/Marquee/img-7.jpg", // pinned image
  "/Marquee/img-8.jpg",
  "/Marquee/img-9.jpg",
  "/Marquee/img-10.jpg",
  "/Marquee/img-11.jpg",
  "/Marquee/img-12.jpg",
  "/Marquee/img-13.jpg",
];

const slides = [
  {
    tag: "Warm up",
    text: `Mo man hanh trinh: gia vi Thai rang nong, rau thom va trai cay so che truoc gio mo bep.`,
    image: "/Marquee/slide-1.jpg",
  },
  {
    tag: "Signature",
    text: `Noi bat giua bua toi: Pad Thai caramen, Tom Yum chua cay vua phai va ga nuong la chanh them huong khoi.`,
    image: "/Marquee/slide-2.jpg",
  },
  {
    tag: "Refresh",
    text: `Khoang nghi nhe: salad xoai xanh, goi cuon tom Thai va mocktail pandan giam cay, lam nguoi.`,
    image: "/Marquee/slide-7.jpg",
  },
  {
    tag: "Dessert",
    text: `Ket thuc am ap: xoi xoai dua, kem dua non va Thai tea panna cotta de lai vi ngot diu dang.`,
    image: "/Marquee/slide-4.jpg",
  },
];

export function MarqueeScroller() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedCloneRef = useRef<HTMLImageElement | null>(null);
  const flipRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const totalPanels = slides.length + 1; // spacer + slides
  const maxTranslate = ((totalPanels - 1) / totalPanels) * 100; // wrapper shift %
  const maxImageShift = (totalPanels - 1) * 100; // pinned image shift %

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
  }, [maxImageShift, maxTranslate]);

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
        <h1>
          Salathai mo hanh trinh am thuc Thai hien dai: nguyen lieu tuoi, gia vi
          can bang va khong gian am ap cho moi cuoc hen.
        </h1>
      </section>

      <section className="wjy-marquee">
        <div className="wjy-marquee-wrapper">
          <div className="wjy-marquee-images">
            {marqueeImages.map((src, idx) => (
              <div
                key={src}
                className={`wjy-marquee-img${idx === 6 ? " pin" : ""}`}
              >
                <img src={src} alt={`marquee-${idx + 1}`} />
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
            <div key={slide.image} className="wjy-horizontal-slide">
              <div className="wjy-slide-tag">{slide.tag}</div>
              <div className="col text">
                <h3>{slide.text}</h3>
              </div>
              <div className="col image">
                <img src={slide.image} alt={`slide-${idx + 1}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="wjy-progress">
          <div ref={progressRef} className="bar" />
        </div>
      </section>

      <section className="wjy-outro">
        <h1>
          Gap go Salathai: noi huong la chanh, ca ri va than lua hoa cung cau
          chuyen moi moi toi.
        </h1>
      </section>
    </div>
  );
}

export default MarqueeScroller;
