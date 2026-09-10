"use client";

import { useState } from "react";
import type { BpmSearchResult } from "@/lib/bpm/types";

type BpmSearchPanelProps = {
  beatMultiplier: number;
  onApplyBpm: (bpm: number, meta: { title: string; artist: string }) => void;
};

export function BpmSearchPanel({
  beatMultiplier,
  onApplyBpm,
}: BpmSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BpmSearchResult[]>([]);
  const [configured, setConfigured] = useState(true);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bpm/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setConfigured(data.configured !== false);
        setError(data.message ?? "Search failed");
        setResults([]);
        return;
      }
      setConfigured(true);
      setResults(data.results ?? []);
      if (data.error) {
        setError(String(data.error));
      } else if ((data.results ?? []).length === 0) {
        setError('No matches — try "Closer Chainsmokers" or "Closer - The Chainsmokers".');
      }
    } catch {
      setError("Search request failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <div className="mt-5 border-t border-gel/20 pt-4">
        <p className="font-ui text-[13px] font-medium uppercase tracking-[0.28em] text-mute">
          BPM search · v3
        </p>
        <p className="mt-2 font-ui text-[13px] text-gel">
          Add GETSONGBPM_API_KEY on the server (free at getsongbpm.com/api).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-gel/20 pt-4">
      <p className="font-ui text-[13px] font-medium uppercase tracking-[0.28em] text-mute">
        BPM search · v3
      </p>
      <p className="mt-1 font-ui text-[13px] text-mute">
        Lookup tempo by song name — also used automatically when Spotify has no
        BPM.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. Closer Chainsmokers"
          className="min-w-0 flex-1 border-0 border-b border-gel/35 bg-transparent px-0 py-2 font-ui text-base text-ink outline-none placeholder:text-mute/50 focus:border-gel"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || !query.trim()}
          className="bg-gel px-3 py-2 font-ui text-sm font-semibold text-void hover:bg-gel-hot disabled:opacity-40"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
      {error && <p className="mt-2 font-ui text-[13px] text-gel">{error}</p>}
      {results.length > 0 && (
        <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                disabled={r.bpm == null}
                onClick={() =>
                  r.bpm != null &&
                  onApplyBpm(r.bpm, { title: r.title, artist: r.artist })
                }
                className="flex w-full items-center justify-between gap-2 px-1 py-1.5 text-left font-ui text-sm hover:bg-well disabled:opacity-40"
              >
                <span className="truncate text-ink">
                  {r.title}
                  <span className="text-mute"> — {r.artist}</span>
                </span>
                <span className="shrink-0 text-mute">
                  {r.bpm != null ? `${r.bpm} BPM` : "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 font-ui text-[13px] text-mute/70">
        BPM data via{" "}
        <a
          href="https://getsongbpm.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-gel/40 underline-offset-2 hover:text-gel"
        >
          GetSongBPM
        </a>
        . Applies CPS using your {beatMultiplier}× beat multiplier.
      </p>
    </div>
  );
}
