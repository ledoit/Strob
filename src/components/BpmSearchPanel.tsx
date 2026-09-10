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
      <div className="mt-4 border border-[#2c2c2e] bg-[#141416] p-3">
        <p className="rack-label">Tempo</p>
        <p className="mt-2 font-mono text-[11px] text-[#c4c4bc]">
          Add GETSONGBPM_API_KEY on the server (free at getsongbpm.com/api).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-[#2c2c2e] bg-[#141416] p-3">
      <p className="rack-label">Tempo</p>
      <p className="mt-1 text-xs text-[#9a9a94]">
        Lookup BPM by song — also used when Spotify has no tempo.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. Closer Chainsmokers"
          className="min-w-0 flex-1 border border-[#2c2c2e] bg-[#0b0b0c] px-3 py-2 text-sm text-[#f2f1ee] outline-none placeholder:text-[#5a5a56] focus:border-[#d8d5cc]"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || !query.trim()}
          className="border border-[#2c2c2e] px-3 py-2 font-mono text-[11px] tracking-wide text-[#f2f1ee] hover:border-[#d8d5cc] disabled:opacity-40"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
      {error && (
        <p className="mt-2 font-mono text-[11px] text-[#f2f1ee]">{error}</p>
      )}
      {results.length > 0 && (
        <ul className="mt-2 max-h-36 space-y-px overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                disabled={r.bpm == null}
                onClick={() =>
                  r.bpm != null &&
                  onApplyBpm(r.bpm, { title: r.title, artist: r.artist })
                }
                className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-sm hover:bg-[#1c1c1e] disabled:opacity-40"
              >
                <span className="truncate text-[#f2f1ee]">
                  {r.title}
                  <span className="text-[#9a9a94]"> — {r.artist}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-[#9a9a94]">
                  {r.bpm != null ? `${r.bpm}` : "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[10px] text-[#6a6a64]">
        BPM data via{" "}
        <a
          href="https://getsongbpm.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[#3a3a3c] underline-offset-2 hover:text-[#9a9a94]"
        >
          GetSongBPM
        </a>
        . Applies rate at {beatMultiplier}× beat.
      </p>
    </div>
  );
}
