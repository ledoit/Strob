export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
].join(" ");

export const SPOTIFY_COOKIE = {
  access: "strob_spotify_access",
  refresh: "strob_spotify_refresh",
  expires: "strob_spotify_expires",
  state: "strob_spotify_oauth_state",
} as const;

export function getAppOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getSpotifyRedirectUri(): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  return `${getAppOrigin()}/api/spotify/callback`;
}

export function spotifyConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
  );
}
