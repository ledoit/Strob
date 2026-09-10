"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bpmToCps } from "@/lib/cps";
import { ControllerPanel } from "@/components/ControllerPanel";
import { StrobeCanvas } from "@/components/StrobeCanvas";
import { DEFAULT_BEAT_MULTIPLIER } from "@/lib/cps";
import {
  controllerStorageKey,
  generateControllerToken,
  isValidSessionCode,
  normalizeSessionCode,
} from "@/lib/session-code";
import { getStoredBeatMultiplier } from "@/lib/spotify/client-storage";
import {
  notifyManualCpsOverride,
  useSpotifySync,
} from "@/hooks/useSpotifySync";
import { useSessionParty } from "@/hooks/useSessionParty";

export default function ControllerPage() {
  const params = useParams();
  const code = normalizeSessionCode(String(params.code ?? ""));
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [beatMultiplier, setBeatMultiplier] = useState(DEFAULT_BEAT_MULTIPLIER);
  const appliedBpmRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isValidSessionCode(code)) return;
    let stored = sessionStorage.getItem(controllerStorageKey(code));
    if (!stored) {
      stored = generateControllerToken();
      sessionStorage.setItem(controllerStorageKey(code), stored);
    }
    setToken(stored);
    setBeatMultiplier(getStoredBeatMultiplier());
  }, [code]);

  const viewerUrl = useMemo(() => {
    if (typeof window === "undefined") return `/v/${code}`;
    return `${window.location.origin}/v/${code}`;
  }, [code]);

  const { state, viewerCount, connected, canControl, patch } = useSessionParty({
    room: code,
    controllerToken: token,
    onError: setAuthError,
  });

  const onCpsFromBpm = useCallback(
    (cps: number) => {
      if (canControl) patch({ cps });
    },
    [canControl, patch],
  );

  const spotify = useSpotifySync({
    enabled: true,
    canControl,
    beatMultiplier,
    onCpsFromBpm,
  });

  const handleManualCps = useCallback(
    (cps: number) => {
      notifyManualCpsOverride();
      spotify.disableSync();
      patch({ cps });
    },
    [patch, spotify],
  );

  const handleBeatMultiplier = useCallback(
    (m: number) => {
      setBeatMultiplier(m);
      spotify.setBeatMultiplier(m);
      if (appliedBpmRef.current != null && canControl) {
        patch({ cps: bpmToCps(appliedBpmRef.current, m) });
      }
    },
    [spotify, canControl, patch],
  );

  const handleApplyBpm = useCallback(
    (bpm: number) => {
      appliedBpmRef.current = bpm;
      notifyManualCpsOverride();
      spotify.disableSync();
      if (canControl) patch({ cps: bpmToCps(bpm, beatMultiplier) });
    },
    [beatMultiplier, canControl, patch, spotify],
  );

  if (!isValidSessionCode(code)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void text-ink">
        <div className="text-center">
          <p className="font-display text-3xl font-bold tracking-tight">
            Invalid session code
          </p>
          <Link
            href="/"
            className="mt-4 inline-block font-ui text-sm uppercase tracking-[0.2em] text-gel underline decoration-gel/50 underline-offset-4"
          >
            Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <StrobeCanvas state={state} />
      {authError && (
        <div className="fixed top-4 left-1/2 z-30 -translate-x-1/2 bg-arm px-4 py-2 font-ui text-sm text-white">
          {authError}
        </div>
      )}
      <ControllerPanel
        sessionCode={code}
        state={state}
        connected={connected}
        canControl={canControl}
        viewerCount={viewerCount}
        onPatch={patch}
        onManualCps={handleManualCps}
        onApplyBpm={handleApplyBpm}
        viewerUrl={viewerUrl}
        spotify={{
          ...spotify,
          beatMultiplier,
          onBeatMultiplierChange: handleBeatMultiplier,
        }}
      />
      <Link
        href="/"
        className="fixed top-5 left-5 z-30 font-ui text-sm font-medium uppercase tracking-[0.22em] text-white/80 hover:text-white"
      >
        ← Strob
      </Link>
    </>
  );
}
