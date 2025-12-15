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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useGetLandingMenuAdminQuery,
  useUpdateLandingMenuMutation,
} from "@/services/api";
import type { LandingMenuItem } from "@/types/landing";

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
      {loading ? "Đang tải..." : error ? "Lỗi" : value}
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
      {active ? "Hiển thị" : "Ẩn"}
    </span>
  );
}

export default function AdminHome() {
  const params = useParams();
  const locale = String(params?.locale || "vi");
  const { data, isFetching, isError, refetch } = useGetLandingMenuAdminQuery();
  const [toggleActive] = useUpdateLandingMenuMutation();

  const items: LandingMenuItem[] = (data?.items ?? []).slice().sort((a, b) => {
    if (a.orderIndex === b.orderIndex)
      return a.createdAt.localeCompare(b.createdAt);
    return a.orderIndex - b.orderIndex;
  });

  const total = items.length;
  const active = items.filter((i) => i.isActive).length;
  const hidden = total - active;

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
              Quản lý hình ảnh + thứ tự menu hiển thị ở trang landing, cập nhật
              nội dung tức thì.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill
                label="Tổng mục"
                value={total}
                loading={isFetching}
                error={isError}
              />
              <StatPill
                label="Đang hiển thị"
                value={active}
                loading={isFetching}
                error={isError}
              />
              <StatPill
                label="Đang ẩn"
                value={hidden}
                loading={isFetching}
                error={isError}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button asChild size="lg">
              <Link href={`/${locale}/admin/landing-menu`}>
                Mở trang quản lý
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Danh sách nhanh
              </CardTitle>
              {isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chưa có mục landing menu nào.
              </p>
            )}
            {items.slice(0, 6).map((item) => (
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
                      #{item.orderIndex} · {item.altText || "Chưa có alt"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[320px]">
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
                    {item.isActive ? "Ẩn nhanh" : "Hiển thị"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Hành động nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-neutral-900">
                Thêm/sửa Landing Menu
              </p>
              <p className="text-xs text-muted-foreground">
                Tạo mới, thay alt text, bật/tắt hiển thị, sắp xếp thứ tự.
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-1">
                <Link href={`/${locale}/admin/landing-menu`}>
                  Đi tới trang Landing Menu
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lưu ý: thay đổi sẽ ảnh hưởng trực tiếp tới landing page (gallery
              tròn), hãy kiểm tra alt text và thứ tự trước khi publish.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
