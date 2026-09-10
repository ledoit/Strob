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
      setError("Enter a 4-character show code (A–Z, 2–9).");
      return;
    }
    setError(null);
    router.push(`/v/${code}`);
  };

  const joinController = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setError("Enter a 4-character show code (A–Z, 2–9).");
      return;
    }
    setError(null);
    router.push(`/c/${code}`);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[#0b0b0c] xl:flex-row">
      <section className="flex w-full flex-col justify-center px-6 py-16 xl:w-[28rem] xl:shrink-0 xl:border-r xl:border-[#2c2c2e] xl:px-10">
        <p className="rack-label">Party engineering</p>
        <h1 className="mt-3 font-mono text-4xl font-medium tracking-tight text-[#f2f1ee]">
          STROB
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#9a9a94]">
          One board. Many walls. Live-synced program output for the room.
        </p>

        <button
          type="button"
          onClick={createSession}
          className="mt-10 h-12 w-full bg-[#d8d5cc] font-mono text-sm font-medium tracking-wide text-[#0b0b0c] hover:bg-[#ece9e1]"
        >
          New patch
        </button>

        <div className="mt-8 border border-[#2c2c2e] bg-[#141416] p-4">
          <label htmlFor="code" className="rack-label block">
            Show code
          </label>
          <input
            id="code"
            value={joinCode}
            onChange={(e) =>
              setJoinCode(normalizeSessionCode(e.target.value))
            }
            maxLength={4}
            placeholder="ABCD"
            className="mt-3 w-full border border-[#2c2c2e] bg-[#0b0b0c] px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-[#f2f1ee] uppercase outline-none placeholder:text-[#3a3a3c] focus:border-[#d8d5cc]"
          />
          {error && (
            <p className="mt-2 text-left text-sm text-[#f2f1ee]">{error}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={joinViewer}
              className="h-11 border border-[#2c2c2e] font-mono text-xs tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc]"
            >
              Join output
            </button>
            <button
              type="button"
              onClick={joinController}
              className="h-11 border border-[#2c2c2e] font-mono text-xs tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc]"
            >
              Open board
            </button>
          </div>
        </div>
      </section>

      <section className="relative hidden min-h-[40vh] flex-1 flex-col p-4 xl:flex">
        <p className="rack-label px-1 pb-2">Program</p>
        <div className="relative min-h-0 flex-1 border border-[#2c2c2e] bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#3a3a3c] uppercase">
              Standby — no patch
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
