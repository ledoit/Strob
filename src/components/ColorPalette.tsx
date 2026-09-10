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
};

export function ColorPalette({ colors, onChange }: ColorPaletteProps) {
  const slots = Array.from(
    { length: MOODLIGHT_SLOT_COUNT },
    (_, i) => colors[i] ?? MOODLIGHT_COLOR_SLOTS[i] ?? "",
  );

  return (
    <div>
      <p className="mb-2 font-ui text-[13px] font-medium uppercase tracking-[0.28em] text-mute">
        Scenes
      </p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((color, index) => {
          const hex = normalizeHex(color);
          const isBlank = !hex;
          return (
            <label
              key={index}
              className="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-well ring-1 ring-gel/20 transition hover:ring-gel"
              title={
                isBlank ? `Color ${index + 1} (empty)` : `Color ${index + 1}`
              }
            >
              <span
                className="h-10 w-10 rounded-full ring-1 ring-black/40"
                style={{
                  backgroundColor: isBlank ? BLANK_SLOT_COLOR : hex,
                }}
              />
              <span className="font-ui text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                {index + 1}
              </span>
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
          );
        })}
      </div>
    </div>
  );
}
