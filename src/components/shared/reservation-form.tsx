"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useCreateReservationRequestMutation } from "@/services/api";
import type { ReservationRequestPayload } from "@/types/reservation";

type ReservationFormProps = {
  onSuccess?: (data: ReservationRequestPayload) => void;
  variant?: "inline" | "modal";
};

const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]*$/u;

function buildReservationSchema(t: ReturnType<typeof useTranslations>) {
  return z
    .object({
      fullName: z
        .string()
        .trim()
        .transform(normalizeName)
        .refine((val) => val.length >= 3, {
          message: t("validation.fullNameMin"),
        })
        .refine((val) => val.length <= 80, {
          message: t("validation.fullNameMax"),
        })
        .refine((val) => NAME_REGEX.test(val), {
          message: t("validation.fullNamePattern"),
        })
        .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
          message: t("validation.fullNameParts"),
        }),
      phoneNumber: z
        .string()
        .trim()
        .refine(isValidPhoneNumber, {
          message: t("validation.phone"),
        }),
      email: z
        .string()
        .trim()
        .email(t("validation.email"))
        .optional()
        .or(z.literal("")),
      guestCount: z
        .number()
        .int()
        .min(1, t("validation.guestMin"))
        .max(30, t("validation.guestMax")),
      reservationDate: z.string().min(1, t("validation.dateRequired")),
      reservationTime: z.string().min(1, t("validation.timeRequired")),
      note: z
        .string()
        .trim()
        .max(400, t("validation.noteMax"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      const reservationDateTime = buildDateTime(
        values.reservationDate,
        values.reservationTime
      );
      if (!reservationDateTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reservationTime"],
          message: t("validation.timeInvalid"),
        });
        return;
      }

      const now = new Date();
      if (reservationDateTime.getTime() < now.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reservationDate"],
          message: t("validation.timePast"),
        });
      }
    });
}

type ReservationFormValues = z.infer<ReturnType<typeof buildReservationSchema>>;

function buildDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const isValid =
    [year, month, day, hour, minute].every(
      (part) => typeof part === "number" && !Number.isNaN(part)
    ) &&
    month >= 1 &&
    month <= 12;
  if (!isValid) return null;
  const candidate = new Date(year, month - 1, day, hour, minute, 0);
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getMonth() + 1 !== month ||
    candidate.getDate() !== day
  ) {
    return null;
  }
  return candidate;
}

function isValidPhoneNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  const normalized = digitsOnly.startsWith("84")
    ? digitsOnly.slice(2)
    : digitsOnly.startsWith("0")
    ? digitsOnly.slice(1)
    : digitsOnly;
  return /^[1-9]\d{8}$/.test(normalized);
}

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+84"))
    return `0${trimmed.replace(/\D/g, "").slice(2)}`;
  if (trimmed.startsWith("84"))
    return `0${trimmed.replace(/\D/g, "").slice(2)}`;
  return trimmed.replace(/\s+/g, "");
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function ReservationForm({
  onSuccess,
  variant = "inline",
}: ReservationFormProps) {
  const t = useTranslations("reservation");
  const schema = useMemo(() => buildReservationSchema(t), [t]);
  const defaultDate = useMemo(() => formatDateInput(new Date()), []);
  const [minSelectableTime, setMinSelectableTime] = useState<
    string | undefined
  >(undefined);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      guestCount: 2,
      reservationDate: defaultDate,
      reservationTime: "19:00",
      note: "",
    },
  });
  const [createReservationRequest, { isLoading }] =
    useCreateReservationRequestMutation();

  const watchDate = watch("reservationDate");

  useEffect(() => {
    if (watchDate !== defaultDate) {
      setMinSelectableTime(undefined);
      return;
    }
    const now = new Date();
    setMinSelectableTime(formatTimeInput(now));
  }, [watchDate, defaultDate]);

  const isBusy = isSubmitting || isLoading;
  const cardStyle =
    variant === "modal"
      ? "bg-white text-neutral-900 shadow-2xl"
      : "bg-[var(--base-200,#f7f7f5)] text-neutral-900 shadow-lg";

  const onSubmit = async (values: ReservationFormValues) => {
    const payload: ReservationRequestPayload = {
      fullName: values.fullName,
      phoneNumber: normalizePhoneNumber(values.phoneNumber),
      email: values.email?.trim() || undefined,
      guestCount: values.guestCount,
      reservationDate: values.reservationDate,
      reservationTime: values.reservationTime,
      note: values.note?.trim() || undefined,
      source: "website",
    };

    try {
      await createReservationRequest(payload).unwrap();
      toast.success(t("successTitle"), {
        description: t("successDesc"),
      });
      reset({
        fullName: "",
        phoneNumber: "",
        email: "",
        guestCount: values.guestCount,
        reservationDate: values.reservationDate,
        reservationTime: values.reservationTime,
        note: "",
      });
      onSuccess?.(payload);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t("errorDesc");
      toast.error(t("errorTitle"), {
        description: message,
      });
    }
  };

  return (
    <div
      className={`w-full rounded-3xl border border-black/5 ${cardStyle} overflow-hidden`}
    >
      <div className="grid grid-cols-1 gap-6 p-5 sm:gap-7 sm:p-7 lg:grid-cols-5 lg:p-10">
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.12em] text-orange-500">
              {t("sectionTitle")}
            </p>
            <h3 className="text-2xl font-semibold leading-tight text-neutral-900">
              {t("heading")}
            </h3>
            <p className="text-sm text-neutral-600">{t("description")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="md:col-span-2 flex min-w-0 flex-col gap-2 text-sm font-medium">
                {t("fullNameLabel")}
                <input
                  {...register("fullName")}
                  name="fullName"
                  placeholder={t("fullNamePlaceholder")}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  aria-invalid={Boolean(errors.fullName)}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
                {t("phoneLabel")}
                <input
                  {...register("phoneNumber")}
                  name="phoneNumber"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  aria-invalid={Boolean(errors.phoneNumber)}
                  autoComplete="tel"
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <label className="col-span-2 md:col-span-2 flex min-w-0 flex-col gap-2 text-sm font-medium">
                {t("emailLabel")}
                <input
                  {...register("email")}
                  name="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
                {t("guestLabel")}
                <select
                  {...register("guestCount", { valueAsNumber: true })}
                  name="guestCount"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  aria-invalid={Boolean(errors.guestCount)}
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                {errors.guestCount && (
                  <p className="text-xs text-red-600">
                    {errors.guestCount.message}
                  </p>
                )}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
                {t("dateLabel")}
                <input
                  {...register("reservationDate")}
                  name="reservationDate"
                  type="date"
                  min={defaultDate}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  aria-invalid={Boolean(errors.reservationDate)}
                />
                {errors.reservationDate && (
                  <p className="text-xs text-red-600">
                    {errors.reservationDate.message}
                  </p>
                )}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
                {t("timeLabel")}
                <input
                  {...register("reservationTime")}
                  name="reservationTime"
                  type="time"
                  min={minSelectableTime}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  aria-invalid={Boolean(errors.reservationTime)}
                />
                {errors.reservationTime && (
                  <p className="text-xs text-red-600">
                    {errors.reservationTime.message}
                  </p>
                )}
              </label>
            </div>

            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
              {t("noteLabel")}
              <textarea
                {...register("note")}
                name="note"
                rows={3}
                placeholder={t("notePlaceholder")}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                aria-invalid={Boolean(errors.note)}
              />
              {errors.note && (
                <p className="text-xs text-red-600">{errors.note.message}</p>
              )}
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isBusy}
                className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isBusy ? t("submitting") : t("submit")}
              </button>
              <span className="text-xs text-neutral-500">{t("privacy")}</span>
            </div>
          </form>
        </div>

        <div className="space-y-4 rounded-2xl bg-white/70 p-5 backdrop-blur lg:col-span-2 min-w-0">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              {t("contactLabel")}
            </p>
            <a
              href="tel:0868555057"
              className="text-lg font-semibold text-neutral-900 underline-offset-2 transition hover:text-orange-600 hover:underline"
            >
              0868 555 057
            </a>
            <p className="text-sm text-neutral-600">{t("addressLine")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-neutral-700">
            <div className="min-w-0 rounded-xl border border-neutral-200/70 bg-white px-4 py-3">
              <p className="font-semibold text-neutral-900">
                {t("openingHourLabel")}
              </p>
              <p>10:00 - 22:00</p>
            </div>
            <div className="min-w-0 rounded-xl border border-neutral-200/70 bg-white px-4 py-3">
              <p className="font-semibold text-neutral-900">
                {t("emailLabelSecondary")}
              </p>
              <p className="break-words text-sm text-neutral-700">
                salathaivietnam@gmail.com
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            {t("arrivalNote")}
          </div>
        </div>
      </div>
    </div>
  );
}
