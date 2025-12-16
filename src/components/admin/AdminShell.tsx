/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Link, getPathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  Images,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  slug?: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, slug: "" },
  { key: "landing", label: "Landing menu", icon: Images, slug: "landing-menu" },
  {
    key: "marquee-slides",
    label: "Marquee slides",
    icon: Images,
    slug: "marquee-slides",
  },
  { key: "products", label: "Products", icon: Boxes, slug: "products" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = String(params?.locale || "vi");

  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Đọc trạng thái sau khi mount để tránh lệch SSR/CSR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("admin.sidebar");
    if (stored === "collapsed") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (collapsed) localStorage.setItem("admin.sidebar", "collapsed");
    else localStorage.removeItem("admin.sidebar");
  }, [collapsed]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("logout failed", err);
    } finally {
      router.replace(`/${locale}/login`);
    }
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* SIDEBAR */}
      <aside
        className={`hidden shrink-0 border-r bg-card transition-[width] duration-200 md:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-dvh w-full flex-col">
          {/* Header */}
          <div className="px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!collapsed && (
                  <div>
                    <p className="text-sm font-semibold">Salathai Admin</p>
                    <p className="text-xs text-muted-foreground">
                      Control Panel
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                title={collapsed ? "Mở rộng" : "Thu gọn"}
              >
                {collapsed ? (
                  <ChevronsRight className="size-4" />
                ) : (
                  <ChevronsLeft className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <Separator />

          {/* Nav */}
          <ScrollArea className="flex-1">
            <nav className="space-y-1 px-2 py-3">
              {NAV_ITEMS.map((it) => {
                const path = it.slug ? `/admin/${it.slug}` : "/admin";
                const href = path;
                const localizedPath = getPathname({
                  href: path as any,
                  locale: locale as any,
                }) as string | undefined;
                const matchesPrefix = (target?: string) =>
                  target
                    ? pathname === target ||
                      pathname === `${target}/` ||
                      pathname.startsWith(`${target}/`)
                    : false;
                const matchesExact = (target?: string) =>
                  target
                    ? pathname === target || pathname === `${target}/`
                    : false;
                const active = it.slug
                  ? matchesPrefix(localizedPath) || matchesPrefix(path)
                  : matchesExact(localizedPath) || matchesExact(path);
                const Icon = it.icon;

                return (
                  <Link
                    key={it.key}
                    href={href as any}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      active
                        ? "border border-orange-200 bg-orange-50 text-orange-700 shadow-sm"
                        : "text-neutral-700 hover:bg-muted"
                    }`}
                    title={collapsed ? it.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      className={`size-4 opacity-80 group-hover:opacity-100 ${
                        active ? "text-orange-600" : "text-neutral-600"
                      }`}
                    />
                    {!collapsed && (
                      <span
                        className={`truncate ${
                          active ? "font-semibold text-orange-800" : ""
                        }`}
                      >
                        {it.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Footer: Avatar + Logout */}
          <div className="p-3">
            <div
              className={`flex items-center gap-3 rounded-md px-2 py-2 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Avatar className="size-8">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium leading-5">
                    Admin
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    admin@salathai.com.vn
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 ${
                collapsed ? "justify-center" : ""
              }`}
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className="size-4" />
              {!collapsed && "Đăng xuất"}
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* Topbar (mobile) */}
        <div className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold">Salathai Admin</span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
