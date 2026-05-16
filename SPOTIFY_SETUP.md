# Spotify setup (Strob v2)

## Your steps

1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app**.
2. **App name:** Strob (or any name).
3. **Redirect URIs** — add **both**:
   - `http://localhost:3000/api/spotify/callback`
   - `https://YOUR-VERCEL-DOMAIN/api/spotify/callback`
4. Copy **Client ID** and **Client secret**.
5. Add to `.env.local` (local) and Vercel project env (production):

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

On Vercel, set `NEXT_PUBLIC_APP_URL` to `https://your-domain.vercel.app` (no trailing slash).

6. Restart `pnpm dev` or redeploy Vercel.
7. On the **controller** page → **Connect Spotify** → approve scopes.
8. Play a track in Spotify (desktop or phone with Spotify Connect).
9. Choose beat multiplier → **Sync CPS to beat**.

## Usage

- **Sync CPS to beat** — polls now-playing every 3s; updates session CPS from BPM × multiplier.
- **Manual slider** — disables sync until you press **Sync CPS to beat** again.
- **Manual CPS (stop sync)** — same as slider override.

## Requirements

- Spotify account (free tier is fine for Web API metadata).
- Something must be **actively playing** on your account (app open, device selected).
- Some tracks lack BPM in audio-features; pick another track or use manual CPS until v3 search.

## Redirect URI mismatch?

The callback URL must match **exactly** what is in the Spotify app settings, including `http` vs `https` and no trailing slash.
