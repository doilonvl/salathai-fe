/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001/api/v1";

export async function GET(req: Request) {
  const api = API_BASE.replace(/\/$/, "");
  let upstream: Response;

  try {
    upstream = await fetch(`${api}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
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
    const message = (data as any)?.message ?? "Unauthorized";
    return NextResponse.json({ message }, { status: upstream.status || 401 });
  }

  const res = NextResponse.json(data ?? { ok: true }, {
    status: upstream.status,
  });

  const setCookies =
    (upstream.headers as any).getSetCookie?.() ??
    upstream.headers.get("set-cookie")?.split(/,(?=[^;]+=[^;]+;)/g) ??
    [];

  for (const cookie of setCookies) {
    res.headers.append("set-cookie", cookie);
  }

  return res;
}
