import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppOrigin, SPOTIFY_COOKIE } from "@/lib/spotify/config";
import {
  exchangeCodeForTokens,
  setTokenCookies,
} from "@/lib/spotify/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const origin = getAppOrigin();

  if (error) {
    return NextResponse.redirect(
      `${origin}/?spotify=denied`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/?spotify=error`);
  }

  const jar = await cookies();
  const stored = jar.get(SPOTIFY_COOKIE.state)?.value;
  jar.delete(SPOTIFY_COOKIE.state);

  if (!stored) {
    return NextResponse.redirect(`${origin}/?spotify=error`);
  }

  const [expectedState, encodedReturn] = stored.split("|");
  if (state !== expectedState) {
    return NextResponse.redirect(`${origin}/?spotify=error`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await setTokenCookies(tokens);
  } catch {
    return NextResponse.redirect(`${origin}/?spotify=error`);
  }

  const returnTo = encodedReturn
    ? decodeURIComponent(encodedReturn)
    : "/";
  const safeReturn = returnTo.startsWith("/") ? returnTo : "/";

  return NextResponse.redirect(`${origin}${safeReturn}?spotify=connected`);
}
