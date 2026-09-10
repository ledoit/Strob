"use client";

import Link from "next/link";
import { useAutoHide } from "@/hooks/useAutoHide";
import type { SessionState } from "@/lib/session-state";

type ViewerChromeProps = {
  sessionCode: string;
  state: SessionState;
  viewerCount: number;
  connected: boolean;
};

export function ViewerChrome({
  sessionCode,
  state,
  viewerCount,
  connected,
}: ViewerChromeProps) {
  const { visible } = useAutoHide(2500);
  const statusLine = state.playing
    ? `${state.cps} changes/sec · ${viewerCount} connected`
    : `Paused · ${viewerCount} connected`;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

      <Link
        href="/"
        className={`absolute top-5 left-5 font-ui text-sm font-medium uppercase tracking-[0.22em] text-white/80 hover:text-white ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        ← Leave
      </Link>
      <p className="absolute top-5 left-1/2 -translate-x-1/2 font-ui text-[13px] font-medium uppercase tracking-[0.32em] text-white/70">
        {sessionCode}
      </p>

      {!connected && (
        <div className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 font-ui text-sm tracking-wide text-ink">
          Connecting to session…
        </div>
      )}

      <div
        className={`absolute right-5 bottom-8 left-5 ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <p className="font-display text-5xl leading-none font-extrabold tracking-[0.18em] text-white">
          {sessionCode}
        </p>
        <p className="mt-2 font-ui text-base font-medium text-white/75">
          {statusLine}
        </p>
        <p className="mt-3 font-ui text-[13px] uppercase tracking-[0.18em] text-white/45">
          Press F11 for full screen
        </p>
      </div>
    </div>
  );
}
