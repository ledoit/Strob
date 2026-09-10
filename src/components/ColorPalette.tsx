"use client";

import {
  BLANK_SLOT_COLOR,
  MOODLIGHT_COLOR_SLOTS,
  MOODLIGHT_SLOT_COUNT,
  normalizeHex,
} from "@/lib/colors";

type ColorPaletteProps = {
  colors: string[];
  onChange: (colors: string[]) => void;
  activeSlot?: number;
};

function cueLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ColorPalette({
  colors,
  onChange,
  activeSlot = -1,
}: ColorPaletteProps) {
  const slots = Array.from(
    { length: MOODLIGHT_SLOT_COUNT },
    (_, i) => colors[i] ?? MOODLIGHT_COLOR_SLOTS[i] ?? "",
  );

  return (
    <div>
      <p className="rack-label">Cue list</p>
      <ol className="mt-2 list-none border border-[#2c2c2e] p-0">
        {slots.map((color, index) => {
          const hex = normalizeHex(color);
          const isBlank = !hex;
          const live = index === activeSlot;
          return (
            <li key={index}>
              <label
                className={`relative flex cursor-pointer items-stretch border-b border-[#2c2c2e] last:border-b-0 ${
                  live ? "bg-[#1c1c1e]" : "bg-[#141416]"
                }`}
                title={
                  isBlank ? `Cue ${cueLabel(index)} (empty)` : `Cue ${cueLabel(index)}`
                }
              >
                <span
                  className={`flex w-10 shrink-0 items-center justify-center font-mono text-[10px] tracking-wider ${
                    live ? "text-[#f2f1ee]" : "text-[#9a9a94]"
                  }`}
                >
                  {cueLabel(index)}
                </span>
                <span
                  className="min-h-8 min-w-0 flex-1"
                  style={{
                    backgroundColor: isBlank ? BLANK_SLOT_COLOR : hex,
                  }}
                />
                <input
                  type="color"
                  value={isBlank ? "#ffffff" : hex}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const next = [...slots];
                    next[index] = e.target.value;
                    onChange(next);
                  }}
                />
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
