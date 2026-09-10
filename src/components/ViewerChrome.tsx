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

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`fixed bottom-4 left-4 border border-white/15 bg-black/55 px-3 py-2 font-mono text-[#f2f1ee] backdrop-blur-sm ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <p className="text-[10px] tracking-[0.22em] text-white/55 uppercase">
          Output
        </p>
        <p className="text-lg tracking-[0.28em]">{sessionCode}</p>
        <p className="text-[11px] tracking-wide text-white/60">
          {viewerCount} out
          {" · "}
          {state.playing ? `${state.cps.toFixed(2)} /s` : "STBY"}
        </p>
      </div>
      <p className="fixed right-4 bottom-4 font-mono text-[10px] tracking-wider text-white/35 uppercase">
        F11 full screen
      </p>
      <Link
        href="/"
        className={`fixed top-4 left-4 border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[11px] tracking-wide text-white/70 backdrop-blur-sm hover:text-white ${
          visible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        Leave wall
      </Link>
      {!connected && (
        <div className="pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 border border-white/15 bg-black/80 px-4 py-2 font-mono text-[11px] tracking-wide text-[#f2f1ee]">
          Patching…
        </div>
      )}
    </div>
  );
}
