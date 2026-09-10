"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  controllerStorageKey,
  generateControllerToken,
  generateSessionCode,
  isValidSessionCode,
  normalizeSessionCode,
} from "@/lib/session-code";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createSession = () => {
    const code = generateSessionCode();
    const token = generateControllerToken();
    sessionStorage.setItem(controllerStorageKey(code), token);
    router.push(`/c/${code}`);
  };

  const joinViewer = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setError("Enter a 4-character session code (A–Z, 2–9).");
      return;
    }
    setError(null);
    router.push(`/v/${code}`);
  };

  const joinController = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setError("Enter a 4-character session code (A–Z, 2–9).");
      return;
    }
    setError(null);
    router.push(`/c/${code}`);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_115%,rgba(255,176,32,0.18),transparent_55%)]"
      />
      <div className="relative w-full max-w-md">
        <p className="font-ui text-[13px] font-medium uppercase tracking-[0.42em] text-gel">
          Desk / wall
        </p>
        <h1 className="mt-2 font-display text-[clamp(4.5rem,18vw,7.5rem)] leading-[0.8] font-extrabold tracking-tight text-ink">
          STROB
        </h1>
        <p className="mt-5 max-w-sm font-ui text-lg leading-snug font-medium text-mute">
          Live-synced party mood lights. One controller, many viewers.
        </p>

        <button
          type="button"
          onClick={createSession}
          className="mt-10 w-full bg-gel py-4 font-display text-2xl font-extrabold tracking-[0.18em] text-void uppercase hover:bg-gel-hot"
        >
          Create session
        </button>
        <p className="mt-2 font-ui text-[13px] tracking-wide text-mute">
          Opens the lighting desk. Share the 4-character code with the room.
        </p>

        <div className="mt-12 flex items-center gap-3">
          <span className="h-px flex-1 bg-gel/25" />
          <span className="font-ui text-[13px] font-medium uppercase tracking-[0.32em] text-mute">
            Or join
          </span>
          <span className="h-px flex-1 bg-gel/25" />
        </div>

        <label
          htmlFor="code"
          className="mt-6 block font-ui text-[13px] font-medium uppercase tracking-[0.28em] text-ink"
        >
          Access code
        </label>
        <input
          id="code"
          value={joinCode}
          onChange={(e) => setJoinCode(normalizeSessionCode(e.target.value))}
          maxLength={4}
          placeholder="ABCD"
          autoComplete="off"
          spellCheck={false}
          className="mt-2 w-full border-0 border-b border-gel/40 bg-transparent px-0 py-3 text-center font-display text-5xl font-extrabold tracking-[0.42em] text-ink uppercase outline-none placeholder:text-mute/40 focus:border-gel"
        />
        {error && (
          <p className="mt-2 font-ui text-sm text-gel" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={joinViewer}
          className="mt-6 w-full border border-gel bg-transparent py-3.5 font-display text-xl font-bold tracking-[0.16em] text-gel uppercase hover:bg-gel hover:text-void"
        >
          Join as viewer
        </button>
        <button
          type="button"
          onClick={joinController}
          className="mt-3 w-full py-2 font-ui text-sm font-medium uppercase tracking-[0.2em] text-mute hover:text-gel"
        >
          Open controller instead
        </button>
      </div>
    </main>
  );
}
