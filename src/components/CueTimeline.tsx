"use client";

import { useStrobeDisplay } from "@/hooks/useStrobeDisplay";
import {
  BLANK_SLOT_COLOR,
  MAX_CPS,
  MIN_CPS,
  MOODLIGHT_COLOR_SLOTS,
  MOODLIGHT_SLOT_COUNT,
  normalizeHex,
  slotIndexForPaletteIndex,
} from "@/lib/colors";
import type { SessionState } from "@/lib/session-state";

type CueTimelineProps = {
  state: SessionState;
  onChangeColors: (colors: string[]) => void;
  onManualCps: (cps: number) => void;
};

function cueLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function CueTimeline({
  state,
  onChangeColors,
  onManualCps,
}: CueTimelineProps) {
  const { index } = useStrobeDisplay(state);
  const activeSlot = slotIndexForPaletteIndex(state.colors, index);
  const slots = Array.from(
    { length: MOODLIGHT_SLOT_COUNT },
    (_, i) => state.colors[i] ?? MOODLIGHT_COLOR_SLOTS[i] ?? "",
  );
  const ratePct = Math.max(
    0,
    Math.min(100, ((state.cps - MIN_CPS) / (MAX_CPS - MIN_CPS)) * 100),
  );

  return (
    <div className="relative z-10 shrink-0 border-t border-[#2c2c2e] bg-[#101012]">
      <div className="flex items-center justify-between gap-3 px-3 py-1.5">
        <p className="rack-label">Cue stack</p>
        <p className="font-mono text-[10px] tracking-wider text-[#9a9a94]">
          {state.playing ? "LIVE" : "STBY"}
          <span className="ml-3 text-[#f2f1ee]">
            {state.cps.toFixed(2)} /s
          </span>
        </p>
      </div>

      <div className="flex h-11 border-t border-[#2c2c2e]">
        {slots.map((color, i) => {
          const hex = normalizeHex(color);
          const isBlank = !hex;
          const live = i === activeSlot && state.playing;
          return (
            <label
              key={i}
              className="relative h-11 min-w-0 flex-1 cursor-pointer border-r border-[#2c2c2e] last:border-r-0"
              title={isBlank ? `Cue ${cueLabel(i)} (empty)` : `Cue ${cueLabel(i)}`}
            >
              <span
                className="absolute inset-x-0 top-0 z-10 flex justify-center pt-0.5 font-mono text-[9px] tracking-wider text-white/80"
                style={{ textShadow: "0 1px 2px #000" }}
              >
                {cueLabel(i)}
              </span>
              <span
                className="absolute inset-0"
                style={{
                  backgroundColor: isBlank ? BLANK_SLOT_COLOR : hex,
                }}
              />
              {live && (
                <span className="absolute inset-y-0 left-0 z-10 w-px bg-[#f2f1ee]" />
              )}
              <input
                type="color"
                value={isBlank ? "#ffffff" : hex}
                className="absolute inset-0 z-20 cursor-pointer opacity-0"
                onChange={(e) => {
                  const next = [...slots];
                  next[i] = e.target.value;
                  onChangeColors(next);
                }}
              />
            </label>
          );
        })}
      </div>

      <div className="relative h-7 border-t border-[#2c2c2e]">
        <div
          className="pointer-events-none absolute inset-y-2 left-0 bg-[#2c2c2e]"
          style={{ width: `${ratePct}%` }}
        />
        <label htmlFor="cue-rate" className="sr-only">
          Rate
        </label>
        <input
          id="cue-rate"
          type="range"
          min={MIN_CPS}
          max={MAX_CPS}
          step={0.05}
          value={state.cps}
          onChange={(e) => onManualCps(Number(e.target.value))}
          className="dimmer absolute inset-0 h-full cursor-pointer bg-transparent"
        />
      </div>
    </div>
  );
}
