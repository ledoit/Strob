import type { BpmMatch, BpmSearchResult } from "./types";

const API_BASE = "https://api.getsongbpm.com";

type GetSongBpmArtist = { name?: string };
type GetSongBpmSong = {
  id?: string;
  title?: string;
  tempo?: string | number;
  artist?: GetSongBpmArtist;
};

type GetSongBpmSearchResponse = {
  search?: GetSongBpmSong[];
};

export function getsongbpmConfigured(): boolean {
  return Boolean(process.env.GETSONGBPM_API_KEY);
}

function parseTempo(tempo: string | number | undefined): number | null {
  if (tempo == null) return null;
  const n = typeof tempo === "number" ? tempo : Number.parseFloat(tempo);
  if (!Number.isFinite(n) || n <= 0 || n > 300) return null;
  return Math.round(n);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(feat\.[^)]+\)/gi, "")
    .replace(/\(with[^)]+\)/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchScore(
  title: string,
  artist: string,
  candidate: GetSongBpmSong,
): number {
  const wantTitle = normalize(title);
  const wantArtist = normalize(artist);
  const gotTitle = normalize(candidate.title ?? "");
  const gotArtist = normalize(candidate.artist?.name ?? "");
  let score = 0;
  if (gotTitle === wantTitle) score += 50;
  else if (gotTitle.includes(wantTitle) || wantTitle.includes(gotTitle)) score += 25;
  if (gotArtist === wantArtist) score += 40;
  else if (
    gotArtist.includes(wantArtist) ||
    wantArtist.includes(gotArtist) ||
    wantArtist.split(" ").some((w) => w.length > 2 && gotArtist.includes(w))
  ) {
    score += 20;
  }
  return score;
}

async function searchRaw(lookup: string): Promise<GetSongBpmSong[]> {
  const apiKey = process.env.GETSONGBPM_API_KEY;
  if (!apiKey) return [];

  const url = new URL(`${API_BASE}/search/`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("type", "both");
  url.searchParams.set("lookup", lookup);
  url.searchParams.set("limit", "12");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as GetSongBpmSearchResponse;
  return data.search ?? [];
}

export async function searchGetSongBpm(
  query: string,
): Promise<BpmSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || !getsongbpmConfigured()) return [];

  const items = await searchRaw(trimmed);
  const seen = new Set<string>();

  return items
    .map((item) => {
      const bpm = parseTempo(item.tempo);
      const title = item.title?.trim() ?? "";
      const artist = item.artist?.name?.trim() ?? "";
      const id = item.id ?? `${title}-${artist}`;
      return {
        id,
        title,
        artist,
        bpm,
        source: "getsongbpm" as const,
      };
    })
    .filter((r) => {
      if (!r.title || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
}

export async function lookupGetSongBpm(
  title: string,
  artist: string,
): Promise<BpmMatch | null> {
  if (!getsongbpmConfigured()) return null;

  const queries = [
    `${title} ${artist}`,
    `${artist} ${title}`,
    title,
  ];

  let best: { song: GetSongBpmSong; score: number } | null = null;

  for (const q of queries) {
    const results = await searchRaw(q);
    for (const song of results) {
      const score = matchScore(title, artist, song);
      const bpm = parseTempo(song.tempo);
      if (bpm == null || score < 30) continue;
      if (!best || score > best.score) {
        best = { song, score };
      }
    }
    if (best && best.score >= 60) break;
  }

  if (!best) return null;

  const bpm = parseTempo(best.song.tempo);
  if (bpm == null) return null;

  return {
    bpm,
    source: "getsongbpm",
    title: best.song.title ?? title,
    artist: best.song.artist?.name ?? artist,
  };
}
