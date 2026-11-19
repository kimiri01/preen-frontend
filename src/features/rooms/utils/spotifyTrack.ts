/** Accept a raw Spotify track ID, official track URL or Spotify track URI only. */
export function spotifyTrackId(value: string): string | null {
  const text = value.trim()
  if (/^[A-Za-z0-9]{22}$/.test(text)) return text
  const uri = /^spotify:track:([A-Za-z0-9]{22})$/.exec(text)
  if (uri) return uri[1]
  try {
    const url = new URL(text)
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'open.spotify.com' ||
      url.port ||
      url.username ||
      url.password
    )
      return null
    return (
      /^\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})\/?$/.exec(
        url.pathname,
      )?.[1] ?? null
    )
  } catch {
    return null
  }
}
