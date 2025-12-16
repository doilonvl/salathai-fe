"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Images,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useGetLandingMenuAdminQuery,
  useUpdateLandingMenuMutation,
} from "@/services/admin.landing-menu";
import { useGetMarqueeSlidesAdminQuery } from "@/services/admin.marquee-slides";
import type { LandingMenuItem } from "@/types/landing";
import type { MarqueeSlide } from "@/types/marquee";

function StatPill({
  label,
  value,
  loading,
  error,
}: {
  label: string;
  value: number;
  loading?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-3 py-1.5 text-xs font-medium text-amber-900">
      {loading ? "Dang tai..." : error ? "Loi" : value}
      <span className="text-[11px] font-normal text-amber-800/90">{label}</span>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
      }`}
    >
      {active ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {active ? "Hien thi" : "An"}
    </span>
  );
}

export default function AdminHome() {
  const params = useParams();
  const locale = String(params?.locale || "vi");
  const {
    data: landingData,
    isFetching: landingLoading,
    isError: landingError,
    refetch: refetchLanding,
  } = useGetLandingMenuAdminQuery();
  const {
    data: marqueeData,
    isFetching: marqueeLoading,
    isError: marqueeError,
    refetch: refetchMarquee,
  } = useGetMarqueeSlidesAdminQuery();
  const [toggleActive] = useUpdateLandingMenuMutation();

  const landingItems: LandingMenuItem[] = (landingData?.items ?? [])
    .slice()
    .sort((a, b) => {
      if (a.orderIndex === b.orderIndex)
        return a.createdAt.localeCompare(b.createdAt);
      return a.orderIndex - b.orderIndex;
    });

  const marqueeItems: MarqueeSlide[] = (marqueeData?.items ?? [])
    .slice()
    .sort((a, b) => {
      if (a.orderIndex === b.orderIndex)
        return a.createdAt.localeCompare(b.createdAt);
      return a.orderIndex - b.orderIndex;
    });

  const landingTotal = landingItems.length;
  const landingActive = landingItems.filter((i) => i.isActive).length;
  const landingHidden = landingTotal - landingActive;

  const marqueeTotal = marqueeItems.length;
  const marqueeActive = marqueeItems.filter((i) => i.isActive).length;
  const marqueeHidden = marqueeTotal - marqueeActive;

  const handleQuickToggle = async (item: LandingMenuItem) => {
    try {
      await toggleActive({
        id: item.id,
        body: { isActive: !item.isActive },
      }).unwrap();
    } catch (err) {
      console.error("TOGGLE_LANDING_MENU_FAILED", err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-white shadow-sm">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Admin
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
                Landing menu
              </h1>
              <p className="text-sm text-muted-foreground">
                Quan ly hinh anh + thu tu menu hien thi o trang landing, cap
                nhat noi dung tung the.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatPill
                  label="Tong muc"
                  value={landingTotal}
                  loading={landingLoading}
                  error={landingError}
                />
                <StatPill
                  label="Dang hien thi"
                  value={landingActive}
                  loading={landingLoading}
                  error={landingError}
                />
                <StatPill
                  label="Dang an"
                  value={landingHidden}
                  loading={landingLoading}
                  error={landingError}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => refetchLanding()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Lam moi
              </Button>
              <Button asChild size="lg">
                <Link href={`/${locale}/admin/landing-menu`}>
                  Mo trang quan ly
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-sky-200/70 bg-gradient-to-r from-sky-50 via-white to-white shadow-sm">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="h-4 w-4" />
                Marquee
              </p>
              <h2 className="text-2xl font-semibold leading-tight text-neutral-900">
                Marquee slides
              </h2>
              <p className="text-sm text-muted-foreground">
                Trang thai slide marquee (tag + text), sap xep thu tu va doi
                thong tin hien thi.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatPill
                  label="Tong slide"
                  value={marqueeTotal}
                  loading={marqueeLoading}
                  error={marqueeError}
                />
                <StatPill
                  label="Dang hien thi"
                  value={marqueeActive}
                  loading={marqueeLoading}
                  error={marqueeError}
                />
                <StatPill
                  label="Dang an"
                  value={marqueeHidden}
                  loading={marqueeLoading}
                  error={marqueeError}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => refetchMarquee()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Lam moi
              </Button>
              <Button asChild size="lg">
                <Link href={`/${locale}/admin/marquee-slides`}>
                  Mo trang marquee
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Danh sach nhanh
              </CardTitle>
              {landingLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {landingItems.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chua co muc landing menu nao.
              </p>
            )}
            {landingItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/60 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm">
                    <Images className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      #{item.orderIndex} - {item.altText || "Chua co alt"}
                    </p>
                    <p className="max-w-[320px] truncate text-xs text-muted-foreground">
                      {item.imageUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge active={item.isActive} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickToggle(item)}
                    className="text-xs"
                  >
                    {item.isActive ? "An nhanh" : "Hien thi"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Hanh dong nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-neutral-900">
                Them/sua Landing Menu
              </p>
              <p className="text-xs text-muted-foreground">
                Tao moi, thay alt text, bat/tat hien thi, sap xep thu tu.
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-1">
                <Link href={`/${locale}/admin/landing-menu`}>
                  Di toi trang Landing Menu
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-neutral-900">
                Them/sua Marquee slides
              </p>
              <p className="text-xs text-muted-foreground">
                Cap nhat tag, text, thu tu, bat/tat hien thi.
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-1">
                <Link href={`/${locale}/admin/marquee-slides`}>
                  Di toi trang Marquee
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Luu y: thay doi se anh huong truc tiep toi landing page, vui long
              kiem tra thu tu va noi dung truoc khi publish.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Marquee slides gan day
              </CardTitle>
              {marqueeLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {marqueeItems.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chua co slide marquee nao.
              </p>
            )}
            {marqueeItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                    <Images className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      #{item.orderIndex} - {item.tag || "Chua co tag"}
                    </p>
                    <p className="max-w-[320px] truncate text-xs text-muted-foreground">
                      {item.text || "Chua co noi dung"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge active={item.isActive} />
                  <Button asChild size="sm" variant="ghost" className="text-xs">
                    <Link href={`/${locale}/admin/marquee-slides`}>
                      Chi tiet
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
