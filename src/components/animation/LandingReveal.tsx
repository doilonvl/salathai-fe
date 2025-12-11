// LandingReveal.tsx
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { ReservationForm } from "@/components/shared/reservation-form";

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

// Update length to match the number of images in /public/Menu.
const menuImages = Array.from({ length: 15 }, (_, i) => `/Menu/${i + 1}.jpg`);

export function LandingReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const rotationTweenRef = useRef<gsap.core.Tween | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const selectedImageRef = useRef<string | null>(null);
  const currentIndexRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);
  const [showCenterLogo, setShowCenterLogo] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, Flip);
    CustomEase.create(
      "hop",
      "M0,0 C0.053,0.604 0.157,0.72 0.293,0.837 0.435,0.959 0.633,1 1,1"
    );

    const container = containerRef.current!;
    const gallery = galleryRef.current!;
    const itemsCount = menuImages.length;
    if (itemsCount === 0) return;
    let isCircularLayout = false;
    // Trả lại tỉ lệ gần với bản gốc, cộng thêm thu nhỏ theo viewport cho responsive
    const baseScale =
      itemsCount >= 14 ? 1 : Math.min(1.6, 1 + (14 - itemsCount) * 0.05);
    const viewportScale = Math.min(
      1,
      Math.max(0.55, (container.offsetWidth || 1200) / 1200)
    );
    const sizeScale = baseScale * viewportScale;
    const itemWidth = 175 * sizeScale;
    const itemHeight = 250 * sizeScale;
    const itemGap = Math.max(6, 10 * viewportScale);

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
        const item = document.createElement("div");
        item.classList.add("lr-item");
        item.style.width = `${itemWidth}px`;
        item.style.height = `${itemHeight}px`;
        item.style.transformOrigin = "50% 50%";
        item.dataset.src = src;
        item.dataset.index = String(idx);

        const img = document.createElement("img");
        img.src = src;
        img.alt = "Menu image";

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
                  gsap.to(".lr-nav-item p", {
                    y: 0,
                    duration: 1,
                    ease: "power3.inOut",
                    stagger: 0.075,
                  });
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
      const radius = Math.max(210, itemWidth * 1.2);
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
          attachInteractions(true);
        },
      });

      isCircularLayout = !isCircularLayout;
    };

    const run = async () => {
      await preloadImages();
      createItems();
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

    return () => {
      gallery.innerHTML = "";
      rotationTweenRef.current?.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="top"
      className={`${plusJakarta.variable} ${playfair.variable} landing-reveal relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#fff6e9_0%,#ffe9d2_35%,#f7d8c3_60%,#f0c8af_100%)] text-black`}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="lr-nav-item">
            <a href="#top">
              <p className="translate-y-5">Home</p>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-10">
          <div className="lr-nav-item">
            <button
              type="button"
              onClick={() => setShowReservationModal(true)}
              className="focus:outline-none"
            >
              <p className="translate-y-5">Reservations</p>
            </button>
          </div>
          <div className="lr-nav-item">
            <a href="#contact-footer">
              <p className="translate-y-5">Contact Us</p>
            </a>
          </div>
        </div>
      </nav>
      <div className="lr-loader absolute left-1/2 bottom-[15%] h-5 w-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="lr-loader-number block translate-y-5">0</p>
      </div>

      <div ref={galleryRef} className="lr-gallery absolute inset-0"></div>

      {showCenterLogo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/Logo/Logo1.jpg"
            alt="Salathai logo"
            className="lr-center-logo h-12 w-12 rounded-full object-contain opacity-85 drop-shadow-lg"
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
          className="lr-nav-btn absolute left-[1%] top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-black shadow"
          onClick={(e) => {
            e.stopPropagation();
            if (currentIndexRef.current === null) return;
            const nextIdx =
              (currentIndexRef.current - 1 + menuImages.length) %
              menuImages.length;
            currentIndexRef.current = nextIdx;
            selectedImageRef.current = menuImages[nextIdx];
            if (overlayImgRef.current) {
              const src = menuImages[nextIdx];
              gsap.fromTo(
                overlayImgRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }
              );
              overlayImgRef.current.src = src;
            }
          }}
        >
          ◀
        </button>
        <button
          type="button"
          className="lr-nav-btn absolute right-[1%] top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-black shadow"
          onClick={(e) => {
            e.stopPropagation();
            if (currentIndexRef.current === null) return;
            const nextIdx = (currentIndexRef.current + 1) % menuImages.length;
            currentIndexRef.current = nextIdx;
            selectedImageRef.current = menuImages[nextIdx];
            if (overlayImgRef.current) {
              const src = menuImages[nextIdx];
              gsap.fromTo(
                overlayImgRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }
              );
              overlayImgRef.current.src = src;
            }
          }}
        >
          ▶
        </button>
      </div>

      {showReservationModal && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowReservationModal(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowReservationModal(false)}
              className="absolute right-3 top-3 z-[1201] inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white shadow-lg transition hover:bg-neutral-800 focus:outline-none"
            >
              X
            </button>
            <ReservationForm
              variant="modal"
              onSubmit={() => setShowReservationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}


