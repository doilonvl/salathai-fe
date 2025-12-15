/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001/api/v1";

export async function POST(req: Request) {
  const body = await req.json();
  const api = API_BASE.replace(/\/$/, "");

  let upstream: Response;
  try {
    upstream = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Upstream unavailable" },
      { status: 502 }
    );
  }

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const message = (data as any)?.message ?? "Login failed";
    return NextResponse.json({ message }, { status: upstream.status || 500 });
  }

  const res = NextResponse.json(data ?? { ok: true }, {
    status: upstream.status,
  });

  // Lấy token từ payload để tự set cookie với domain hợp lệ (tránh domain sai từ upstream)
  const isProd = process.env.NODE_ENV === "production";
  let access =
    (data as any)?.access_token ??
    (data as any)?.accessToken ??
    (data as any)?.token;
  let refresh =
    (data as any)?.refresh_token ??
    (data as any)?.refreshToken ??
    (data as any)?.refresh;

  // Fallback: nếu BE chỉ set cookie (không trả token trong body), lấy từ header Set-Cookie
  if (!access || !refresh) {
    const setCookies =
      (upstream.headers as any).getSetCookie?.() ??
      upstream.headers.get("set-cookie")?.split(/,(?=[^;]+=[^;]+;)/g) ??
      [];
    for (const cookie of setCookies) {
      const match = cookie.match(/^(\w+)=([^;]+)/);
      if (!match) continue;
      const [, name, value] = match;
      if (
        !access &&
        (name === "access_token" || name === "accessToken" || name === "token")
      ) {
        access = value;
      }
      if (
        !refresh &&
        (name === "refresh_token" ||
          name === "refreshToken" ||
          name === "refresh")
      ) {
        refresh = value;
      }
    }
  }

  if (access) {
    res.cookies.set("access_token", access, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    res.cookies.set("access_token_public", access, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
  }

  if (refresh) {
    res.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.set("refresh_token_public", refresh, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}
