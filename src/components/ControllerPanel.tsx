"use client";

import { MAX_CPS, MIN_CPS } from "@/lib/colors";
import type { SessionState } from "@/lib/session-state";
import { ColorPalette } from "./ColorPalette";
import { BpmSearchPanel } from "./BpmSearchPanel";
import { SpotifySyncPanel } from "./SpotifySyncPanel";

type SpotifyProps = {
  configured: boolean;
  connected: boolean;
  syncEnabled: boolean;
  track: {
    name: string;
    artist: string;
    bpm: number | null;
    isPlaying: boolean;
  } | null;
  error: string | null;
  beatMultiplier: number;
  onBeatMultiplierChange: (m: number) => void;
  enableSync: () => void;
  disableSync: () => void;
  logout: () => void;
};

type ControllerPanelProps = {
  sessionCode: string;
  state: SessionState;
  connected: boolean;
  canControl: boolean;
  viewerCount: number;
  onPatch: (patch: Partial<SessionState>) => void;
  onManualCps: (cps: number) => void;
  onApplyBpm: (bpm: number, meta: { title: string; artist: string }) => void;
  viewerUrl: string;
  spotify: SpotifyProps;
};

export function ControllerPanel({
  sessionCode,
  state,
  connected,
  canControl,
  viewerCount,
  onPatch,
  onManualCps,
  onApplyBpm,
  viewerUrl,
  spotify,
}: ControllerPanelProps) {
  const copyViewerLink = async () => {
    await navigator.clipboard.writeText(viewerUrl);
  };

  const cpsLabel = spotify.syncEnabled
    ? `${state.cps.toFixed(2)} / sec (synced)`
    : `${state.cps.toFixed(2)} / sec`;

  const liveLabel = !connected
    ? "Connecting…"
    : !canControl
      ? "Claiming session…"
      : `${viewerCount} connected`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-h-[85vh] max-w-xl overflow-y-auto">
      <div className="border-t border-gel/30 bg-chassis/95 p-4 backdrop-blur-md">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-ui text-[13px] font-medium uppercase tracking-[0.32em] text-mute">
              Room
            </p>
            <p className="font-display text-4xl leading-none font-extrabold tracking-[0.22em] text-ink">
              {sessionCode}
            </p>
          </div>
          <div className="flex items-center gap-2 font-ui text-sm font-medium uppercase tracking-[0.16em] text-mute">
            <span
              className={`inline-block h-2 w-2 ${connected ? "bg-gel" : "bg-arm"}`}
            />
            {liveLabel}
          </div>
        </div>

        <ColorPalette
          colors={state.colors}
          onChange={(colors) => onPatch({ colors })}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="cps"
              className="mb-2 block font-ui text-[13px] font-medium uppercase tracking-[0.28em] text-mute"
            >
              Rate{" "}
              <span className="text-ink">{cpsLabel}</span>
            </label>
            <input
              id="cps"
              type="range"
              min={MIN_CPS}
              max={MAX_CPS}
              step={0.05}
              value={state.cps}
              onChange={(e) => onManualCps(Number(e.target.value))}
              className="strob-fader w-full"
            />
          </div>

          <button
            type="button"
            onClick={() => onPatch({ playing: !state.playing })}
            className={`h-14 min-w-[8rem] px-6 font-display text-xl font-extrabold tracking-[0.14em] uppercase ${
              state.playing
                ? "bg-arm text-white hover:brightness-110"
                : "bg-gel text-void hover:bg-gel-hot"
            }`}
          >
            {state.playing ? "Turn Off" : "Turn On"}
          </button>
        </div>

        <SpotifySyncPanel
          sessionCode={sessionCode}
          configured={spotify.configured}
          connected={spotify.connected}
          syncEnabled={spotify.syncEnabled}
          track={spotify.track}
          error={spotify.error}
          beatMultiplier={spotify.beatMultiplier}
          onBeatMultiplierChange={spotify.onBeatMultiplierChange}
          onEnableSync={spotify.enableSync}
          onDisableSync={spotify.disableSync}
          onLogout={spotify.logout}
        />

        <BpmSearchPanel
          beatMultiplier={spotify.beatMultiplier}
          onApplyBpm={onApplyBpm}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyViewerLink}
            className="border border-gel/30 px-3 py-2 font-ui text-[13px] font-medium uppercase tracking-[0.16em] text-ink hover:border-gel hover:text-gel"
          >
            Copy viewer link
          </button>
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gel/30 px-3 py-2 font-ui text-[13px] font-medium uppercase tracking-[0.16em] text-ink hover:border-gel hover:text-gel"
          >
            Open viewer
          </a>
        </div>
      </div>
    </div>
  );
}
