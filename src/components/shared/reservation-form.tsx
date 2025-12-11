"use client";

import { FormEvent, useState } from "react";

type ReservationFormProps = {
  onSubmit?: (data: Record<string, string>) => void;
  variant?: "inline" | "modal";
};

export function ReservationForm({
  onSubmit,
  variant = "inline",
}: ReservationFormProps) {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    setStatus("submitted");
    onSubmit?.(payload);
  };

  const cardStyle =
    variant === "modal"
      ? "bg-white text-neutral-900 shadow-2xl"
      : "bg-[var(--base-200,#f7f7f5)] text-neutral-900 shadow-lg";

  return (
    <div
      className={`w-full rounded-3xl border border-black/5 ${cardStyle} overflow-hidden`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 lg:p-10">
        <div className="lg:col-span-3 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-orange-500">
              Reservations
            </p>
            <h3 className="text-2xl font-semibold leading-tight">
              Đặt bàn theo ý bạn
            </h3>
            <p className="text-sm text-neutral-600">
              Chọn số người, thời gian và để lại thông tin liên hệ để chúng tôi
              xác nhận ngay.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Họ và tên
                <input
                  name="fullName"
                  required
                  placeholder="Tên của bạn"
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Số điện thoại
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="0868 555 057"
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Số khách
                <select
                  name="guests"
                  defaultValue="2"
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} người
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Ngày
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Giờ
                <input
                  name="time"
                  type="time"
                  required
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Ghi chú thêm
              <textarea
                name="note"
                rows={3}
                placeholder="Yêu cầu món ăn chay, vị trí bàn mong muốn..."
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                Đặt bàn
              </button>
              {status === "submitted" && (
                <span className="text-sm text-emerald-600">
                  Đã nhận thông tin! Chúng tôi sẽ liên hệ lại ngay.
                </span>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4 rounded-2xl bg-white/70 p-5 backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Liên hệ nhanh
            </p>
            <a
              href="tel:0868555057"
              className="text-lg font-semibold text-neutral-900 underline-offset-2 hover:text-orange-600 hover:underline"
            >
              0868 555 057
            </a>
            <p className="text-sm text-neutral-600">
              20 Đường Thành, Hoàn Kiếm, Hà Nội
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-neutral-700">
            <div className="rounded-xl border border-neutral-200/70 bg-white px-4 py-3">
              <p className="font-semibold text-neutral-900">Giờ mở cửa</p>
              <p>10:00 - 22:00</p>
            </div>
            <div className="rounded-xl border border-neutral-200/70 bg-white px-4 py-3">
              <p className="font-semibold text-neutral-900">Email</p>
              <p>hello@salathai.vn</p>
            </div>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            Đặt bàn trực tuyến giúp giữ chỗ trong giờ cao điểm. Vui lòng đến
            sớm hơn 5 phút để được phục vụ tốt nhất.
          </div>
        </div>
      </div>
    </div>
  );
}
