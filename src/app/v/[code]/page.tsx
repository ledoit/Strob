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
      <main className="flex min-h-dvh items-center justify-center bg-[#0b0b0c] text-[#c4c4bc]">
        <div className="text-center">
          <p className="rack-label">Invalid show code</p>
          <Link
            href="/"
            className="mt-4 inline-block font-mono text-sm text-[#f2f1ee] underline decoration-[#6a6a64] underline-offset-2"
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
