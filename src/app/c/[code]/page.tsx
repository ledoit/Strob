"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ControllerPanel } from "@/components/ControllerPanel";
import { StrobeCanvas } from "@/components/StrobeCanvas";
import { useSessionParty } from "@/hooks/useSessionParty";
import {
  controllerStorageKey,
  generateControllerToken,
  isValidSessionCode,
  normalizeSessionCode,
} from "@/lib/session-code";

export default function ControllerPage() {
  const params = useParams();
  const code = normalizeSessionCode(String(params.code ?? ""));
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidSessionCode(code)) return;
    let stored = sessionStorage.getItem(controllerStorageKey(code));
    if (!stored) {
      stored = generateControllerToken();
      sessionStorage.setItem(controllerStorageKey(code), stored);
    }
    setToken(stored);
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

  if (!isValidSessionCode(code)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-300">
        <div className="text-center">
          <p>Invalid session code.</p>
          <Link href="/" className="mt-4 inline-block text-violet-400 underline">
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
        <div className="fixed top-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-red-900/90 px-4 py-2 text-sm text-red-100">
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
        viewerUrl={viewerUrl}
      />
      <Link
        href="/"
        className="fixed top-4 left-4 z-30 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white/70 backdrop-blur hover:text-white"
      >
        Strob
      </Link>
    </>
  );
}
