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
    return <div className="fixed inset-0 bg-void" />;
  }

  if (!accepted) {
    return (
      <MotionlessScreen>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void p-5">
          <div className="w-full max-w-lg">
            <div className="strob-hazard h-3 w-full" aria-hidden />
            <h2 className="mt-8 font-display text-6xl leading-none font-extrabold tracking-tight text-gel uppercase">
              Warning
            </h2>
            <p className="mt-5 max-w-prose font-ui text-lg leading-relaxed font-medium text-ink">
              Before using, make sure you are not sensitive to flashing lights.
              Do not use this application if you, or others around you, have{" "}
              <a
                href="https://en.wikipedia.org/wiki/Photosensitive_epilepsy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gel underline decoration-gel/50 underline-offset-4 hover:decoration-gel"
              >
                photosensitive epilepsy
              </a>
              .
            </p>
            <button
              type="button"
              className="mt-8 bg-gel px-8 py-3 font-display text-2xl font-extrabold tracking-[0.14em] text-void uppercase hover:bg-gel-hot"
              onClick={() => {
                sessionStorage.setItem(STORAGE_KEY, "1");
                setAccepted(true);
              }}
            >
              Ok
            </button>
          </div>
        </div>
      </MotionlessScreen>
    );
  }

  return <>{children}</>;
}

function MotionlessScreen({ children }: { children?: ReactNode }) {
  return <div className="fixed inset-0 bg-void">{children}</div>;
}
