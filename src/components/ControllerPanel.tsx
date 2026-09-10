"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { MAX_CPS, MIN_CPS, slotIndexForPaletteIndex } from "@/lib/colors";
import { useStrobeDisplay } from "@/hooks/useStrobeDisplay";
import type { SessionState } from "@/lib/session-state";
import { ColorPalette } from "./ColorPalette";
import { CueTimeline } from "./CueTimeline";
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
  program: ReactNode;
  authError?: string | null;
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
  program,
  authError,
}: ControllerPanelProps) {
  const { index } = useStrobeDisplay(state);
  const activeSlot = slotIndexForPaletteIndex(state.colors, index);

  const copyViewerLink = async () => {
    await navigator.clipboard.writeText(viewerUrl);
  };

  const statusLabel = !connected
    ? "Connecting"
    : !canControl
      ? "Claiming"
      : `${viewerCount} out`;

  return (
    <div className="flex min-h-dvh flex-col bg-[#0b0b0c] xl:h-dvh xl:overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#2c2c2e] bg-[#101012] px-3 py-2">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-[0.18em] text-[#f2f1ee] hover:text-[#d8d5cc]"
        >
          STROB
        </Link>
        <div>
          <p className="rack-label">Show</p>
          <p className="font-mono text-lg tracking-[0.28em] text-[#f2f1ee]">
            {sessionCode}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#9a9a94]">
          <span
            className={`inline-block h-1.5 w-1.5 ${
              connected && canControl
                ? state.playing
                  ? "bg-[#5eea8a]"
                  : "bg-[#9a9a94]"
                : "bg-[#b42318]"
            }`}
          />
          {statusLabel}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyViewerLink}
            className="border border-[#2c2c2e] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc]"
          >
            Copy output
          </button>
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#2c2c2e] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc]"
          >
            Open output
          </a>
          <button
            type="button"
            onClick={() => onPatch({ playing: !state.playing })}
            className={`h-10 min-w-[5.5rem] px-5 font-mono text-sm tracking-wide ${
              state.playing
                ? "bg-[#b42318] text-white hover:bg-[#c53028]"
                : "bg-[#d8d5cc] text-[#0b0b0c] hover:bg-[#ece9e1]"
            }`}
          >
            {state.playing ? "HOLD" : "GO"}
          </button>
        </div>
      </header>

      {authError && (
        <p className="border-b border-[#2c2c2e] bg-[#1a1010] px-3 py-2 font-mono text-[11px] text-[#f2f1ee]">
          {authError}
        </p>
      )}

      <div className="flex flex-col xl:min-h-0 xl:flex-1 xl:flex-row xl:overflow-hidden">
        <div className="flex flex-col xl:min-h-0 xl:flex-1">
          <section className="relative h-[42vh] shrink-0 p-2 pt-1 xl:h-auto xl:min-h-0 xl:flex-1">
            <p className="rack-label px-1 pb-1">Program</p>
            <div className="relative h-[calc(100%-1.1rem)] overflow-hidden border border-[#2c2c2e] bg-black">
              {program}
            </div>
          </section>
          <CueTimeline
            state={state}
            onChangeColors={(colors) => onPatch({ colors })}
            onManualCps={onManualCps}
          />
        </div>

        <aside className="border-t border-[#2c2c2e] bg-[#101012] p-3 xl:w-80 xl:shrink-0 xl:overflow-y-auto xl:border-t-0 xl:border-l">
          <ColorPalette
            colors={state.colors}
            onChange={(colors) => onPatch({ colors })}
            activeSlot={activeSlot}
          />

          <div className="mt-5">
            <label htmlFor="cps" className="rack-label block">
              Rate
              <span className="ml-2 font-sans tracking-normal text-[#f2f1ee]">
                {spotify.syncEnabled
                  ? `${state.cps.toFixed(2)} /s · locked`
                  : `${state.cps.toFixed(2)} /s`}
              </span>
            </label>
            <input
              id="cps"
              type="range"
              min={MIN_CPS}
              max={MAX_CPS}
              step={0.05}
              value={state.cps}
              onChange={(e) => onManualCps(Number(e.target.value))}
              className="dimmer mt-3"
            />
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
        </aside>
      </div>
    </div>
  );
}
