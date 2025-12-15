import { NextResponse } from "next/server";

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  const clear = (name: string) =>
    res.cookies.set(name, "", {
      httpOnly: name.endsWith("_public") ? false : true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

  clear("access_token");
  clear("access_token_public");
  clear("refresh_token");
  clear("refresh_token_public");

  return res;
}
