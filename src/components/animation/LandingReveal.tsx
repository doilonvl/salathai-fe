"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { ReservationForm } from "@/components/shared/reservation-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useGetLandingMenuQuery } from "@/services/api";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-landing-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-landing-display",
});

export function LandingReveal() {
  const tHeader = useTranslations("header");
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const rotationTweenRef = useRef<gsap.core.Tween | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const selectedImageRef = useRef<string | null>(null);
  const currentIndexRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const initializedRef = useRef(false);
  const lastMenuSignatureRef = useRef<string | null>(null);
  const buildIdRef = useRef(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showCenterLogo, setShowCenterLogo] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);
  const { data: landingMenuData } = useGetLandingMenuQuery();
  const menuItems = useMemo(() => {
    const items = landingMenuData?.items ?? [];
    const seen = new Set<string>();
    // Dedupe defensive: avoid duplicated images when data refetches or locale switches.
    return items.filter((item) => {
      const key = `${item.orderIndex}-${item.imageUrl}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [landingMenuData]);
  const menuImages = useMemo(
    () => menuItems.map((item) => item.imageUrl),
    [menuItems]
  );
  const menuImagesSignature = useMemo(() => menuImages.join("|"), [menuImages]);

  const updateAltTexts = () => {
    const gallery = galleryRef.current;
    if (!gallery || !menuItems.length) return;
    const items = gallery.querySelectorAll<HTMLDivElement>(".lr-item");
    items.forEach((item) => {
      const idx = item.dataset.index ? Number(item.dataset.index) : NaN;
      if (Number.isNaN(idx)) return;
      const img = item.querySelector("img");
      if (img) {
        img.alt = menuItems[idx]?.altText || "Menu image";
      }
    });
  };

  useEffect(() => {
    if (!menuImages.length) return;

    gsap.registerPlugin(CustomEase, Flip);
    CustomEase.create(
      "hop",
      "M0,0 C0.053,0.604 0.157,0.72 0.293,0.837 0.435,0.959 0.633,1 1,1"
    );

    const container = containerRef.current!;
    const gallery = galleryRef.current!;
    const itemsCount = menuImages.length;
    if (itemsCount === 0) return;
    const buildId = ++buildIdRef.current;

    // If the menu images didn't actually change, avoid rebuilding; just update alts.
    if (
      initializedRef.current &&
      lastMenuSignatureRef.current === menuImagesSignature &&
      gallery.children.length
    ) {
      updateAltTexts();
      return;
    }

    // Reset any existing gallery state before building to avoid duplication (e.g., when refetching).
    gallery.innerHTML = "";
    rotationTweenRef.current?.kill();
    isReadyRef.current = false;
    setShowCenterLogo(false);
    setNavReady(false);
    setIsNavVisible(false);

    // Trở lại tỉ lệ gần với bản gốc, cộng thêm thu nhỏ theo viewport cho responsive
    const baseScale =
      itemsCount >= 14 ? 1 : Math.min(1.6, 1 + (14 - itemsCount) * 0.05);
    const vw = container.offsetWidth || window.innerWidth || 1200;
    const viewportScale = Math.min(
      1,
      Math.max(vw < 640 ? 0.45 : 0.6, vw / 1200)
    );
    const sizeScale = baseScale * viewportScale;
    const itemWidth = (vw < 640 ? 165 : 175) * sizeScale;
    const itemHeight = (vw < 640 ? 230 : 250) * sizeScale;
    const itemGap = Math.max(6, (vw < 640 ? 14 : 10) * viewportScale);

    const preloadImages = async () => {
      await Promise.all(
        menuImages.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.src = src;
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );
    };

    const createItems = () => {
      menuImages.forEach((src, idx) => {
        const alt = menuItems[idx]?.altText || "Menu image";
        const item = document.createElement("div");
        item.classList.add("lr-item");
        item.style.width = `${itemWidth}px`;
        item.style.height = `${itemHeight}px`;
        item.style.transformOrigin = "50% 50%";
        item.dataset.src = src;
        item.dataset.index = String(idx);

        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;

        item.appendChild(img);
        gallery.appendChild(item);
      });
    };

    const setInitialLinearLayout = () => {
      const items = gallery.querySelectorAll<HTMLDivElement>(".lr-item");
      if (!items.length) return;
      const linearGap = Math.max(itemGap * 1.6, 14);
      const totalItemsWidth =
        (items.length - 1) * linearGap + items[0].offsetWidth;
      const startX = (container.offsetWidth - totalItemsWidth) / 2;

      items.forEach((item, index) => {
        gsap.set(item, {
          left: `${startX + index * linearGap}px`,
          top: "150%",
          rotation: 0,
        });
      });

      gsap.to(items, {
        top: "50%",
        transform: "translateY(-50%)",
        duration: 1,
        ease: "hop",
        stagger: 0.03,
      });
    };

    const animateCounter = () => {
      const counterElement =
        container.querySelector<HTMLParagraphElement>(".lr-loader p");
      if (!counterElement) return;

      let currentValue = 0;
      const updateInterval = 300;
      const maxDuration = 2000;
      const endValue = 100;
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < maxDuration) {
          currentValue = Math.min(
            currentValue + Math.floor(Math.random() * 30) + 5,
            endValue
          );
          counterElement.textContent = String(currentValue);
          setTimeout(updateCounter, updateInterval);
        } else {
          counterElement.textContent = String(endValue);
          setTimeout(() => {
            gsap.to(counterElement, {
              y: -20,
              duration: 1,
              ease: "power3.inOut",
              onComplete: () => {
                animateToCircularLayout();
                setTimeout(() => {
                  gsap.fromTo(
                    ".lr-nav-item .nav-pill",
                    { y: -12, opacity: 0 },
                    {
                      y: 0,
                      opacity: 1,
                      duration: 1,
                      ease: "power3.inOut",
                      stagger: 0.075,
                    }
                  );
                }, 100);
              },
            });
          }, -300);
        }
      };

      updateCounter();
    };

    const setCircularLayout = () => {
      const items = gallery.querySelectorAll<HTMLDivElement>(".lr-item");
      if (!items.length) return;
      const numberOfItems = items.length;
      const angleIncrement = (2 * Math.PI) / numberOfItems;
      const radius = Math.max(
        vw < 640 ? 220 * viewportScale : 210,
        itemWidth * (vw < 640 ? 1.15 : 1.2)
      );
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;

      items.forEach((item, index) => {
        const angle = index * angleIncrement;
        const x = centerX + radius * Math.cos(angle) - item.offsetWidth / 2;
        const y = centerY + radius * Math.sin(angle) - item.offsetHeight / 2;

        gsap.set(item, {
          left: `${x}px`,
          top: `${y}px`,
          rotation: (angle * 180) / Math.PI - 90,
          transform: "translateY(0%)",
        });
      });
    };

    const attachInteractions = (startRotation = false) => {
      const items = gallery.querySelectorAll<HTMLDivElement>(".lr-item");
      if (!items.length) return;

      const rotation = gsap.to(gallery, {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
        paused: true,
      });
      rotationTweenRef.current = rotation;

      items.forEach((item) => {
        const onEnter = () => {
          if (!isReadyRef.current || selectedImageRef.current) return;
          rotation.pause();
          gsap.to(item, {
            scale: 1.12,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });
        };

        const onLeave = () => {
          if (!isReadyRef.current || selectedImageRef.current) return;
          rotation.resume();
          gsap.to(item, {
            scale: 1,
            duration: 0.25,
            ease: "power2.inOut",
            overwrite: true,
          });
        };

        const onClick = () => {
          if (!isReadyRef.current) return;
          const src = item.dataset.src;
          const idx = item.dataset.index ? Number(item.dataset.index) : null;
          if (!src || idx === null || Number.isNaN(idx)) return;
          selectedImageRef.current = src;
          currentIndexRef.current = idx;
          rotation.pause();
          const overlay = overlayRef.current;
          const overlayImg = overlayImgRef.current;
          if (!overlay || !overlayImg) return;
          overlayImg.src = src;
          overlayImg.alt = menuItems[idx]?.altText || "Full menu";
          overlay.classList.remove("pointer-events-none", "opacity-0");
          gsap.to(overlay, { opacity: 1, duration: 0.2, ease: "power1.out" });
          gsap.fromTo(
            overlayImg,
            { scale: 0.6, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
          );
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);
        item.addEventListener("click", onClick);
      });

      if (startRotation && rotationTweenRef.current) {
        rotationTweenRef.current.play();
      }
    };

    const animateToCircularLayout = () => {
      const items = gallery.querySelectorAll(".lr-item");
      if (!items.length) return;
      gsap.set(items, { transformOrigin: "50% 50%", force3D: true });
      const state = Flip.getState(items);

      setCircularLayout();

      Flip.from(state, {
        duration: 2,
        ease: "hop",
        stagger: -0.03,
        absolute: true,
        scale: false,
        simple: true,
        onComplete: () => {
          isReadyRef.current = true;
          setShowCenterLogo(true);
          setNavReady(true);
          setIsNavVisible(true);
          attachInteractions(true);
        },
      });
    };

    const run = async () => {
      await preloadImages();
      if (buildId !== buildIdRef.current) return;
      createItems();
      if (buildId !== buildIdRef.current) return;
      setInitialLinearLayout();
      gsap.to(".lr-loader p", {
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 1,
        onComplete: animateCounter,
      });
    };

    run();
    initializedRef.current = true;
    lastMenuSignatureRef.current = menuImagesSignature;

    return () => {
      buildIdRef.current++;
      gallery.innerHTML = "";
      rotationTweenRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuImagesSignature]);

  useEffect(() => {
    // Update translated alt text without rebuilding the gallery.
    if (!initializedRef.current) return;
    updateAltTexts();
  }, [menuItems]);

  useEffect(() => {
    if (!navReady) return;
    lastScrollYRef.current = window.scrollY;

    const isMarqueeInView = () => {
      const selectors = [".wjy-marquee", ".wjy-horizontal"];
      return selectors.some((sel) => {
        const el = document.querySelector<HTMLElement>(sel);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });
    };

    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollYRef.current;

      if (isMarqueeInView()) {
        if (isNavVisible) setIsNavVisible(false);
        lastScrollYRef.current = current;
        return;
      }

      if (delta > 6 && isNavVisible) {
        setIsNavVisible(false);
      } else if (delta < -6 && !isNavVisible) {
        setIsNavVisible(true);
      }

      lastScrollYRef.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isNavVisible, navReady]);

  const navVisibilityClass =
    navReady && isNavVisible
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-6 pointer-events-none";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;

    if (showReservationModal) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
  }, [showReservationModal]);

  return (
    <div
      ref={containerRef}
      id="top"
      className={`${plusJakarta.variable} ${playfair.variable} landing-reveal relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#fff6e9_0%,#ffe9d2_35%,#f7d8c3_60%,#f0c8af_100%)] text-black`}
    >
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-4 md:px-8 pt-4 md:pt-6 pb-2 transition-all duration-300 ease-out ${navVisibilityClass}`}
      >
        <style>
          {`
            .nav-pill {
              background: rgba(255,255,255,0.9);
              border: 1px solid rgba(0,0,0,0.08);
            }
          `}
        </style>
        {(() => {
          const navPill =
            "nav-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10";
          return (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-3">
                <div className="lr-nav-item">
                  <a href="#top" className={navPill}>
                    {tHeader("home")}
                  </a>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="lr-nav-item">
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(true)}
                    className={navPill}
                  >
                    {tHeader("reservations")}
                  </button>
                </div>
                <div className="lr-nav-item">
                  <a href="#contact-footer" className={navPill}>
                    {tHeader("contact")}
                  </a>
                </div>
                <div className="lr-nav-item">
                  <LanguageSwitcher className={navPill} />
                </div>
              </div>

              {/* Mobile nav trigger */}
              <div className="flex md:hidden w-full justify-between items-center">
                <div className="lr-nav-item">
                  <a href="#top" className={navPill}>
                    {tHeader("home")}
                  </a>
                </div>
                <button
                  type="button"
                  aria-label="Toggle menu"
                  className="lr-nav-item nav-pill inline-flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/10"
                  onClick={() => setMobileNavOpen((v) => !v)}
                >
                  <span className="block h-[2px] w-6 bg-neutral-800 rounded-sm"></span>
                  <span className="block h-[2px] w-6 bg-neutral-800 rounded-sm"></span>
                  <span className="block h-[2px] w-6 bg-neutral-800 rounded-sm"></span>
                </button>
              </div>
            </>
          );
        })()}
      </nav>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileNavOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={closeMobileNav}
        />
        <div
          className={`absolute right-0 top-0 h-full w-4/5 max-w-xs bg-[radial-gradient(circle_at_30%_20%,#fff6e9_0%,#ffe1c6_50%,#f0c1a2_100%)] shadow-2xl transition-transform duration-300 ${
            mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
            <span className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Menu
            </span>
          </div>
          <div className="flex flex-col gap-3 px-4 py-6">
            <a
              href="#top"
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {tHeader("home")}
            </a>
            <button
              type="button"
              onClick={() => {
                setShowReservationModal(true);
                closeMobileNav();
              }}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {tHeader("reservations")}
            </button>
            <a
              href="#contact-footer"
              onClick={closeMobileNav}
              className="nav-pill inline-flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold uppercase text-neutral-900 shadow-sm backdrop-blur hover:shadow-md"
            >
              {tHeader("contact")}
            </a>
            <LanguageSwitcher className="nav-pill inline-flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm backdrop-blur" />
          </div>
        </div>
      </div>
      <div className="lr-loader absolute left-1/2 bottom-[15%] h-5 w-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="lr-loader-number block translate-y-5">0</p>
      </div>

      <div ref={galleryRef} className="lr-gallery absolute inset-0"></div>

      {showCenterLogo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/Logo/Logo1.png"
            alt="Salathai logo"
            className="lr-center-logo h-10 w-10 md:h-12 md:w-12 rounded-full object-contain opacity-85 drop-shadow-lg"
          />
        </div>
      )}

      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center bg-transparent opacity-0"
        onClick={() => {
          const overlay = overlayRef.current;
          const rotation = rotationTweenRef.current;
          const items = galleryRef.current?.querySelectorAll(".lr-item");
          selectedImageRef.current = null;
          currentIndexRef.current = null;
          if (overlay) {
            gsap.to(overlay, {
              opacity: 0,
              duration: 0.2,
              ease: "power1.out",
              onComplete: () => {
                overlay.classList.add("pointer-events-none");
              },
            });
          }
          if (items?.length) {
            gsap.to(items, { scale: 1, duration: 0.2, overwrite: true });
          }
          if (rotation) rotation.resume();
        }}
      >
        <img
          ref={overlayImgRef}
          alt="Full menu"
          className="lr-overlay-img h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          className="lr-nav-btn absolute left-[1%] top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2.5 py-2 text-xs md:text-sm font-semibold text-black shadow"
          onClick={(e) => {
            e.stopPropagation();
            if (currentIndexRef.current === null || !menuImages.length) return;
            const nextIdx =
              (currentIndexRef.current - 1 + menuImages.length) %
              menuImages.length;
            currentIndexRef.current = nextIdx;
            selectedImageRef.current = menuImages[nextIdx];
            if (overlayImgRef.current) {
              const src = menuImages[nextIdx];
              const alt = menuItems[nextIdx]?.altText || "Full menu";
              gsap.fromTo(
                overlayImgRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }
              );
              overlayImgRef.current.src = src;
              overlayImgRef.current.alt = alt;
            }
          }}
        >
          {"<"}
        </button>
        <button
          type="button"
          className="lr-nav-btn absolute right-[1%] top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2.5 py-2 text-xs md:text-sm font-semibold text-black shadow"
          onClick={(e) => {
            e.stopPropagation();
            if (currentIndexRef.current === null || !menuImages.length) return;
            const nextIdx = (currentIndexRef.current + 1) % menuImages.length;
            currentIndexRef.current = nextIdx;
            selectedImageRef.current = menuImages[nextIdx];
            if (overlayImgRef.current) {
              const src = menuImages[nextIdx];
              const alt = menuItems[nextIdx]?.altText || "Full menu";
              gsap.fromTo(
                overlayImgRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }
              );
              overlayImgRef.current.src = src;
              overlayImgRef.current.alt = alt;
            }
          }}
        >
          {">"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showReservationModal && (
          <motion.div
            key="reservation-overlay"
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-4"
            onClick={() => setShowReservationModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-full max-w-3xl md:max-w-4xl h-[90vh] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="absolute right-3 top-3 z-[1201] inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white shadow-lg transition hover:bg-neutral-800 focus:outline-none"
              >
                X
              </button>
              <ScrollArea className="h-full rounded-3xl">
                <ReservationForm
                  variant="modal"
                  onSuccess={() => setShowReservationModal(false)}
                />
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
