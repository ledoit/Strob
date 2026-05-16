import { NextResponse } from "next/server";
import { clearTokenCookies } from "@/lib/spotify/server";

export async function POST() {
  await clearTokenCookies();
  return NextResponse.json({ ok: true });
}
