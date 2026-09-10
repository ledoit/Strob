"use client";

import { useStrobeDisplay } from "@/hooks/useStrobeDisplay";
import type { SessionState } from "@/lib/session-state";

type StrobeCanvasProps = {
  state: SessionState;
  className?: string;
};

export function StrobeCanvas({ state, className }: StrobeCanvasProps) {
  const { color } = useStrobeDisplay(state);

  return (
    <div
      className={className ?? "fixed inset-0"}
      style={{ backgroundColor: color }}
    />
  );
}
