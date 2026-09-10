"use client";

import { formatBpmSource } from "@/lib/bpm/resolve";
import type { BpmSource } from "@/lib/bpm/types";
import { BPM_MULTIPLIERS } from "@/lib/cps";

type SpotifySyncPanelProps = {
  sessionCode: string;
  configured: boolean;
  connected: boolean;
  syncEnabled: boolean;
  track: {
    name: string;
    artist: string;
    bpm: number | null;
    bpmSource?: BpmSource | null;
    isPlaying: boolean;
  } | null;
  error: string | null;
  beatMultiplier: number;
  onBeatMultiplierChange: (m: number) => void;
  onEnableSync: () => void;
  onDisableSync: () => void;
  onLogout: () => void;
};

export function SpotifySyncPanel({
  sessionCode,
  configured,
  connected,
  syncEnabled,
  track,
  error,
  beatMultiplier,
  onBeatMultiplierChange,
  onEnableSync,
  onDisableSync,
  onLogout,
}: SpotifySyncPanelProps) {
  const loginHref = `/api/spotify/login?returnTo=${encodeURIComponent(`/c/${sessionCode}`)}`;

  if (!configured) {
    return (
      <p className="mt-4 text-xs text-[#9a9a94]">
        Playback sync is not configured on this deployment.
      </p>
    );
  }

  return (
    <div className="mt-5 border border-[#2c2c2e] bg-[#141416] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="rack-label">Playback</p>
        {!connected ? (
          <a
            href={loginHref}
            className="border border-[#2c2c2e] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc]"
          >
            Connect Spotify
          </a>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="border border-[#2c2c2e] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#9a9a94] hover:border-[#d8d5cc] hover:text-[#f2f1ee]"
          >
            Disconnect
          </button>
        )}
      </div>

      {connected && track && (
        <p className="mt-2 truncate font-mono text-[11px] text-[#c4c4bc]">
          {track.name} — {track.artist}
          {track.bpm != null
            ? ` · ${track.bpm} BPM${track.bpmSource ? ` (${formatBpmSource(track.bpmSource)})` : ""}`
            : " · BPM unknown — use Tempo below"}
          {!track.isPlaying ? " (paused)" : ""}
        </p>
      )}

      {connected && (
        <>
          <p className="rack-label mt-3">Beat multiplier</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {BPM_MULTIPLIERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onBeatMultiplierChange(value)}
                className={`px-2.5 py-1 font-mono text-[11px] ${
                  beatMultiplier === value
                    ? "bg-[#d8d5cc] text-[#0b0b0c]"
                    : "bg-[#1c1c1e] text-[#c4c4bc] hover:text-[#f2f1ee]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {!syncEnabled ? (
              <button
                type="button"
                onClick={onEnableSync}
                disabled={!track?.bpm}
                className="bg-[#d8d5cc] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#0b0b0c] hover:bg-[#ece9e1] disabled:opacity-40"
              >
                Lock rate to beat
              </button>
            ) : (
              <button
                type="button"
                onClick={onDisableSync}
                className="border border-[#2c2c2e] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc]"
              >
                Unlock rate
              </button>
            )}
          </div>
          {syncEnabled && (
            <p className="mt-2 font-mono text-[10px] tracking-wide text-[#9a9a94]">
              Locked — move Rate anytime to override.
            </p>
          )}
        </>
      )}

      {error && (
        <p className="mt-2 font-mono text-[11px] text-[#f2f1ee]">{error}</p>
      )}
    </div>
  );
}
