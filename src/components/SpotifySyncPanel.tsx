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
      <p className="mt-5 font-ui text-[13px] text-mute">
        Spotify sync is not configured on this deployment.
      </p>
    );
  }

  return (
    <div className="mt-5 border-t border-gel/20 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-ui text-[13px] font-medium uppercase tracking-[0.28em] text-mute">
          Spotify
        </p>
        {!connected ? (
          <a
            href={loginHref}
            className="bg-[#1db954] px-3 py-1.5 font-ui text-sm font-semibold text-black hover:bg-[#1ed760]"
          >
            Connect Spotify
          </a>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="border border-gel/30 px-3 py-1.5 font-ui text-[13px] uppercase tracking-[0.14em] text-mute hover:border-gel hover:text-gel"
          >
            Disconnect
          </button>
        )}
      </div>

      {connected && track && (
        <p className="mt-2 truncate font-ui text-sm text-ink">
          {track.name} — {track.artist}
          {track.bpm != null
            ? ` · ${track.bpm} BPM${track.bpmSource ? ` (${formatBpmSource(track.bpmSource)})` : ""}`
            : " · BPM unknown — try BPM search below"}
          {!track.isPlaying ? " (paused)" : ""}
        </p>
      )}

      {connected && (
        <>
          <p className="mt-3 font-ui text-[13px] uppercase tracking-[0.22em] text-mute">
            Beat multiplier
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {BPM_MULTIPLIERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onBeatMultiplierChange(value)}
                className={`px-2.5 py-1 font-ui text-sm font-medium ${
                  beatMultiplier === value
                    ? "bg-gel text-void"
                    : "bg-well text-mute hover:text-ink"
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
                className="bg-gel px-3 py-1.5 font-ui text-sm font-semibold text-void hover:bg-gel-hot disabled:opacity-40"
              >
                Sync CPS to beat
              </button>
            ) : (
              <button
                type="button"
                onClick={onDisableSync}
                className="border border-gel/30 px-3 py-1.5 font-ui text-sm text-ink hover:border-gel"
              >
                Manual CPS (stop sync)
              </button>
            )}
          </div>
          {syncEnabled && (
            <p className="mt-2 font-ui text-[13px] text-gel">
              Syncing — move the slider anytime to override manually.
            </p>
          )}
        </>
      )}

      {error && <p className="mt-2 font-ui text-[13px] text-gel">{error}</p>}
    </div>
  );
}
