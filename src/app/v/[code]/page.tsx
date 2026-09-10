"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { StrobeCanvas } from "@/components/StrobeCanvas";
import { ViewerChrome } from "@/components/ViewerChrome";
import { useSessionParty } from "@/hooks/useSessionParty";
import { isValidSessionCode, normalizeSessionCode } from "@/lib/session-code";

export default function ViewerPage() {
  const params = useParams();
  const code = normalizeSessionCode(String(params.code ?? ""));

  const { state, viewerCount, connected } = useSessionParty({
    room: code,
  });

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
      <ViewerChrome
        sessionCode={code}
        state={state}
        viewerCount={viewerCount}
        connected={connected}
      />
    </>
  );
}
