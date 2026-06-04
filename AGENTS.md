# Strob — Agent Playbook

This document captures how Strob was conceived, built, and extended. Future agents should read it before making product or architecture changes.

---

## Product vision

**Strob** is a public-facing MVP: a [moodlight.org](https://www.moodlight.org)-style fullscreen color strobe where **one controller** drives **many viewers** via a short session code. Success means:

- Zero install — URL only, works on phones and laptops
- Sub-second perceived sync at party scale (one room, many screens)
- Minimal UI on the viewer (immersion first; chrome fades away)
- Safety gate for photosensitive epilepsy before any flashing
- Controller is the only writer; viewers are read-only

We optimized for **shipping a trustworthy MVP**, not for maximal features on day one.

---

## Architecture axioms

1. **Derive motion locally, broadcast state sparingly**  
   Do not WebSocket every color tick. Broadcast authoritative `SessionState` with `epochMs` + `colorIndexAtEpoch`; each client computes the current color from wall clock. One patch resyncs everyone after CPS/palette/play changes.

2. **Room = session code**  
   PartyKit room id is the 4-character code. Realtime transport is swappable (PartyKit now; Supabase Realtime later) if `SessionState` and message types stay stable in `src/lib/session-state.ts`.

3. **Controller auth is a shared secret, not user accounts**  
   On session create, generate a UUID `controllerToken` in `sessionStorage`. Party room accepts the first `claim` or matching token for `patch`. Good enough for v1; upgrade to passkeys or host-only create API if abuse appears.

4. **Mirror source material precisely when cloning**  
   Moodlight defaults live in their `main.js`: 8 color *slots* (7 hex + 1 empty holder), default CPS after Disco preset load (~5/sec). Extract from source, not screenshots.

5. **Separate surfaces by role**  
   `/` lobby, `/c/[code]` controller (panel + strobe), `/v/[code]` viewer (strobe + auto-hiding chrome). Do not overload one page with both control and immersion UX.

6. **Fail soft on the network**  
   `partysocket` reconnects; viewers show “Connecting…” until `sync`. Controller queues patches until `claimed`.

---

## Stack (fixed for v1)

| Layer | Choice | Why |
|--------|--------|-----|
| UI | Next.js App Router + React + Tailwind | Deploy on Vercel; familiar DX |
| Realtime | PartyKit (`party/index.ts`) | Rooms map to sessions; edge WS |
| Sync logic | `src/lib/session-state.ts` | Transport-agnostic pure functions |
| Deploy | Vercel (frontend) + PartyKit (WS) | No always-on Node server to operate |

**Production PartyKit host:** `strob-party.ledoit.partykit.dev`  
**Env:** `NEXT_PUBLIC_PARTYKIT_HOST` (hostname only, no scheme)

---

## Execution principles (how we worked)

1. **Read the original behavior before coding** — curl/fetch `main.js`, grep `colors`, `getNextColor`, `setSliderValue`. Do not guess palette or timing.

2. **Smallest diff that completes the user story** — no drive-by refactors, no extra presets until core sync works.

3. **Prove the loop** — `pnpm dev` (Next + PartyKit), two tabs controller/viewer, Turn On, change CPS, confirm match.

4. **Build must pass** — `pnpm build` before calling MVP done.

5. **pnpm `onlyBuiltDependencies`** — include `esbuild`, `workerd`, `sharp` so `pnpm dev` never blocks on interactive `approve-builds`.

6. **Git hygiene** — package name `strob` (lowercase); repo `git@github.com:ledoit/Strob.git`.

---

## UX & writing axioms

- **Warning first** — same moral weight as moodlight; link to photosensitive epilepsy article.
- **Session code is the product** — monospace, wide tracking, copy viewer link from controller.
- **Viewer chrome auto-hides** (~2.5s) and returns on mouse, touch, scroll, key (`useAutoHide`).
- **Controller panel stays visible** — this is the “desk”; viewer is the “wall.”
- **Plain language** — “changes/sec”, “Turn On/Off”, not internal terms like `epochMs`.
- **8 color slots in 4×2 grid** — empty slot = gray `#555`; cycling skips empty via `paletteColors()`.

---

## Key files (map for agents)

| Path | Responsibility |
|------|----------------|
| `src/lib/session-state.ts` | State shape, `applyPatch`, `getColorIndexAt`, re-anchor on CPS change |
| `src/lib/colors.ts` | Moodlight slot defaults, `paletteColors`, CPS bounds |
| `src/lib/session-code.ts` | Code generation, controller token storage keys |
| `party/index.ts` | WS room: `claim`, `patch`, `broadcast sync` |
| `src/hooks/useSessionParty.ts` | Client WS, optimistic patch, claim queue |
| `src/hooks/useStrobeDisplay.ts` | Local color refresh timer |
| `src/hooks/useAutoHide.ts` | Viewer overlay visibility |
| `src/components/ViewerChrome.tsx` | Viewer HUD + Leave |
| `src/components/ControllerPanel.tsx` | CPS, palette, power, share link |

---

## Deploy checklist (agents)

```bash
pnpm party:deploy          # → note *.partykit.dev host
pnpm vercel login          # once per machine
pnpm vercel link           # once per repo checkout
# Set NEXT_PUBLIC_PARTYKIT_HOST on Vercel project
pnpm vercel:prod
```

Vercel CLI is a **devDependency** — use `pnpm vercel`, not global `vercel`.

---

## Versioning

| Version | Scope |
|---------|--------|
| **v1** | Shipped MVP — live sessions, PartyKit sync, moodlight palette, viewer auto-hide |
| **v2** | Spotify — now playing → BPM → CPS with beat multiplier; manual override anytime |
| **v3** | **Shipped** — search bar BPM lookup via GetSongBPM (`BpmSearchPanel`, `GET /api/bpm/search`) |

Do not renumber v1 to v0; it is already public.

## Extension: BPM-synced CPS (Spotify or search)

**v2 implemented** on the controller only; patches `SessionState.cps`. See `SPOTIFY_SETUP.md`.

### Mode model (add to state later)

```ts
type CpsMode =
  | { kind: "manual"; cps: number }
  | { kind: "bpm"; bpm: number; multiplier: number }; // cps = (bpm / 60) * multiplier

// effectiveCps(state) used by sync math
```

Manual slider updates → `kind: "manual"`. “Sync to track” → `kind: "bpm"` with chosen multiplier (½×, 1×, 2×, 4× of beat frequency as *changes per second* — define UX clearly). User can switch modes anytime; manual override does not require disconnecting Spotify.

### Option A — Spotify (now playing)

Flow:

1. OAuth PKCE or server-side token (prefer **Next.js Route Handler** holding client secret).
2. Poll `GET /v1/me/player/currently-playing` (or Web Playback SDK events if you go deep).
3. `GET /v1/audio-features/{trackId}` → `tempo` (BPM).
4. On track change, recompute `cps` and `reanchor` playback.

**Caveats:**

- Spotify Developer app, redirect URIs, rate limits.
- ~% of tracks lack audio features → fallback to search or manual.
- **Terms**: display “Powered by Spotify”, no sync audio; metadata-only is standard.
- Polling latency 1–3s is fine for CPS; strobe does not need sample-accurate beat phase in v1.

### v3 + v2 fallback (implemented)

- `GETSONGBPM_API_KEY` → `src/lib/bpm/getsongbpm.ts`
- `resolveBpm()` tries Spotify tempo (legacy apps only), then GetSongBPM by title+artist
- Spotify now-playing auto-calls `resolveBpm` when audio-features 403
- `GET /api/bpm/search?q=` + `BpmSearchPanel` on controller

### What not to do

- Do not stream audio through Strob.
- Do not put Spotify secrets in client bundles.
- Do not beat-match phase on first version — CPS multiple of BPM is enough.

### Implementation sketch

- `src/app/api/spotify/*` — auth callback, search, audio-features proxy.
- Controller UI: toggle “Manual | BPM sync”, multiplier chips, optional search modal.
- On BPM change: `onPatch({ cps: effectiveCps, ... })` with existing `reanchor` behavior in `applyPatch`.

---

## Supabase alternative (back pocket)

Replace PartyKit with Supabase Realtime channel `session:{code}` broadcasting the same `ServerMessage` JSON. Keep `session-state.ts` unchanged. Add Postgres only if you need session history, abuse limits, or admin.

---

## Quality bar for “public MVP”

- [x] Warning gate before strobe
- [x] Controller + viewer stay in sync for 5+ minutes
- [x] Session code join works cross-device
- [x] `NEXT_PUBLIC_PARTYKIT_HOST` set in production
- [x] No secrets in git
- [x] README + this file updated when behavior changes
- [x] v2 Spotify + v3 GetSongBPM search on controller

---

*Last updated: 2026-05-25 — v3 BPM search shipped; quality checklist reflects production MVP.*
