# Strob

Party engineering: live-synced program output — a [moodlight.org](https://www.moodlight.org)-inspired strobe with a **board** (one controller) and **walls** (many viewers) joined by a 4-character show code.

## Stack

- **Next.js** (App Router) — UI on Vercel
- **PartyKit** — WebSocket rooms per session code
- **Timestamp-anchored sync** — viewers derive the current color locally; controller only sends state patches

## Develop

```bash
pnpm install
pnpm dev
```

Runs Next.js on port 3000 and PartyKit on port 1999.

Open [http://localhost:3000](http://localhost:3000), create a session, copy the viewer link, and open it in another tab or phone on the same network.

## Deploy

1. **PartyKit** — `pnpm party:deploy` and note your host (e.g. `strob-party.username.partykit.dev`).
2. **Vercel** — import `git@github.com:ledoit/Strob.git`, preset **Next.js** (default). Build: `pnpm build`, install: `pnpm install`. Set env `NEXT_PUBLIC_PARTYKIT_HOST` to your PartyKit host (no `https://`).
3. Redeploy the frontend after PartyKit is live.

Vercel CLI (project-local): `pnpm vercel login`, then `pnpm vercel link`, then `pnpm vercel:prod`. Set `NEXT_PUBLIC_PARTYKIT_HOST=strob-party.ledoit.partykit.dev` on Vercel.

See [AGENTS.md](./AGENTS.md) for architecture and [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) for Spotify v2 setup.

**Versions:** v1 = core product · v2 = Spotify BPM sync · v3 = GetSongBPM search (shipped).

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_PARTYKIT_HOST` | Production | PartyKit hostname (no `https://`) |
| `GETSONGBPM_API_KEY` | v3 search | GetSongBPM API for title/artist BPM lookup |
| Spotify OAuth vars | v2 sync | See [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) |

## Supabase (later)

Realtime channels keyed by session code can replace PartyKit if you want Postgres-backed sessions, rate limits, or history. The shared `SessionState` shape in `src/lib/session-state.ts` is transport-agnostic.

## Defaults

Default palette matches moodlight.org’s 8-slot grid (`main.js`): 7 colors + blank 8th holder (`#555` until picked):

`#ff0000`, `#7fff00`, `#ffff00`, `#0000ff`, `#ff7f00`, `#bf00bf`, `#000000`, *(empty)*

Default speed: **5 changes/sec** (moodlight’s Disco preset after load).


## License

All Rights Reserved © Menhir Holdings
