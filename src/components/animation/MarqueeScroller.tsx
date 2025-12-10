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
    text: `Hương vị đường phố Bangkok biến tấu theo phong cách Salathai: Pad Thai caramen, Tom Yum cay nhẹ và gạo thơm được phục vụ ngay khi bếp mở.`,
    image: "/Marquee/slide-1.jpg",
  },
  {
    text: `Bữa tối kéo dài với curry xanh, cá hồi nướng lá chuối và cocktail pandan tạo nên nhịp điệu ấm áp cho những cuộc gặp gỡ tại Salathai.`,
    image: "/Marquee/slide-2.jpg",
  },
];

export function MarqueeScroller() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedCloneRef = useRef<HTMLImageElement | null>(null);
  const flipRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Flip);

    const lenis = new Lenis();
    const onTick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const getColor = (name: string) =>
        getComputedStyle(containerRef.current as HTMLElement)
          .getPropertyValue(name)
          .trim();

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
          gsap.set(".wjy-shell", { backgroundColor: lightColor });
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

          // Background fade
          if (progress <= 0.05) {
            const newBg = mix(lightColor, darkColor, progress / 0.05);
            gsap.set(".wjy-shell", { backgroundColor: newBg });
          } else {
            gsap.set(".wjy-shell", { backgroundColor: darkColor });
          }

          // Flip play
          if (progress <= 0.2) {
            flipRef.current?.progress(progress / 0.2);
          } else if (progress <= 0.95) {
            flipRef.current?.progress(1);
            const horizontalProgress = (progress - 0.2) / 0.75;
            const wrapperTranslateX = -66.67 * horizontalProgress;
            const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
            const imageTranslateX = -slideMovement * 100;

            gsap.set(".wjy-horizontal-wrapper", {
              x: `${wrapperTranslateX}%`,
            });
            if (pinnedCloneRef.current) {
              gsap.set(pinnedCloneRef.current, { x: `${imageTranslateX}%` });
            }
          } else {
            flipRef.current?.progress(1);
            if (pinnedCloneRef.current)
              gsap.set(pinnedCloneRef.current, { x: "-200%" });
            gsap.set(".wjy-horizontal-wrapper", { x: "-66.67%" });
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
  }, []);

  return (
    <div
      ref={containerRef}
      className={`wjy-shell ${plusJakarta.variable} ${playfair.variable}`}
      style={{
        ["--wjy-light" as string]: "#edf1e8",
        ["--wjy-dark" as string]: "#101010",
      }}
    >
      <section className="wjy-hero">
        <h1>
          Salathai giới thiệu hành trình ẩm thực Thái hiện đại: nguyên liệu tươi
          mỗi ngày, gia vị cân bằng và không gian ấm áp cho mọi cuộc hẹn.
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
        <div className="wjy-horizontal-wrapper">
          <div className="wjy-horizontal-slide wjy-horizontal-spacer" />
          {slides.map((slide, idx) => (
            <div key={slide.image} className="wjy-horizontal-slide">
              <div className="col text">
                <h3>{slide.text}</h3>
              </div>
              <div className="col image">
                <img src={slide.image} alt={`slide-${idx + 1}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wjy-outro">
        <h1>
          Gặp gỡ Salathai: nơi hương thơm lá chanh, cà ri và than lửa hòa cùng
          câu chuyện mới mỗi tối.
        </h1>
      </section>
    </div>
  );
}

export default MarqueeScroller;
