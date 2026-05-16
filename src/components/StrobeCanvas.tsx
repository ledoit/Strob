"use client";

import { useStrobeDisplay } from "@/hooks/useStrobeDisplay";
import type { SessionState } from "@/lib/session-state";

type StrobeCanvasProps = {
  state: SessionState;
};

export function StrobeCanvas({ state }: StrobeCanvasProps) {
  const { color } = useStrobeDisplay(state);

  return (
    <div className="fixed inset-0" style={{ backgroundColor: color }} />
  );
}
