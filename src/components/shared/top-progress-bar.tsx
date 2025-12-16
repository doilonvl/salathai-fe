/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevKeyRef = useRef<string | null>(null);
  const timersRef = useRef<number[]>([]);

  // Dọn dẹp timer
  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    if (!pathname) return;

    const key = pathname + "?" + searchParams?.toString();

    // Lần render đầu tiên thì bỏ qua, tránh nháy bar khi load trang lần đầu
    if (prevKeyRef.current === null) {
      prevKeyRef.current = key;
      return;
    }

    // Nếu thật sự thay đổi route/search thì mới chạy hiệu ứng
    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;

    clearTimers();

    setVisible(true);
    setProgress(0);

    // Fake progress mượt mượt
    const t1 = window.setTimeout(() => setProgress(30), 80);
    const t2 = window.setTimeout(() => setProgress(60), 250);
    const t3 = window.setTimeout(() => setProgress(85), 600);
    const t4 = window.setTimeout(() => setProgress(100), 900);
    const t5 = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 1150);

    timersRef.current = [t1, t2, t3, t4, t5];

    return clearTimers;
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px]">
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/12 backdrop-blur-[1px]" />
        {/* Glow nhẹ dưới bar cho sang */}
        <div className="pointer-events-none absolute inset-0 blur-sm opacity-70">
          <div
            className="h-full w-full bg-gradient-to-r from-[#ffe6a3] via-[#ffd06f] to-[#f4a93f]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Thanh chính */}
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-[#ffd06f] via-[#f7b84c] to-[#ef9a35] shadow-[0_0_12px_rgba(0,0,0,0.4)]"
          style={{
            width: `${progress}%`,
            transition: "width 0.18s ease-out",
          }}
        >
          {/* Đầu bar tròn để nhìn premium hơn */}
          <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#fff2c8] shadow-[0_0_8px_rgba(255,242,200,0.95)]" />
        </div>
      </div>
    </div>
  );
}
