"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "strob-warning-accepted";

export function WarningGate({ children }: { children: ReactNode }) {
  const [accepted, setAccepted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccepted(sessionStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="fixed inset-0 bg-[#0b0b0c]" />;
  }

  if (!accepted) {
    return (
      <MotionlessScreen>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0c] p-4">
          <div className="mx-auto w-full max-w-lg border border-[#2c2c2e] bg-[#141416] p-6">
            <p className="rack-label">Photosensitive lockout</p>
            <h1 className="mt-3 font-mono text-2xl leading-tight font-medium tracking-tight text-balance text-[#f2f1ee]">
              Flashing program output
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#c4c4bc]">
              Before going live, confirm you are not sensitive to flashing
              lights. Do not run this board if you, or anyone in the room, has{" "}
              <a
                href="https://en.wikipedia.org/wiki/Photosensitive_epilepsy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f2f1ee] underline decoration-[#6a6a64] underline-offset-2 hover:decoration-[#f2f1ee]"
              >
                photosensitive epilepsy
              </a>
              .
            </p>
            <button
              type="button"
              className="mt-6 h-11 px-6 font-mono text-sm font-medium tracking-wide text-[#0b0b0c] bg-[#d8d5cc] hover:bg-[#ece9e1]"
              onClick={() => {
                sessionStorage.setItem(STORAGE_KEY, "1");
                setAccepted(true);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </MotionlessScreen>
    );
  }

  return <>{children}</>;
}

function MotionlessScreen({ children }: { children?: ReactNode }) {
  return <div className="fixed inset-0 bg-[#0b0b0c]">{children}</div>;
}
