/** A YouTube video id is always exactly 11 url-safe base64 characters. */
export const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

const SHORT_HOST = 'youtu.be'

/** Path prefixes that carry the video id as the next segment. */
const PATH_PREFIXES = ['embed', 'shorts', 'live', 'v']

function idOrNull(candidate: string | undefined | null): string | null {
  if (!candidate) return null
  return YOUTUBE_ID_RE.test(candidate) ? candidate : null
}

/**
 * Extracts the video id from anything a person is likely to paste — the share
 * link (`youtu.be/ID?si=…`), the address bar (`watch?v=ID&t=30s`), a Short, a
 * live stream, an embed url, or the bare id itself. Tracking params are
 * ignored. Returns null for anything that isn't a single YouTube video, so the
 * caller can show an inline error instead of embedding a broken player.
 */
export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // A bare id, pasted straight from somewhere else
  if (YOUTUBE_ID_RE.test(trimmed)) return trimmed

  // People paste "youtu.be/ID" without a scheme; URL() needs one
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)

  if (host === SHORT_HOST || host === `www.${SHORT_HOST}`) {
    return idOrNull(segments[0])
  }

  if (!YOUTUBE_HOSTS.has(host)) return null

  // /watch?v=ID — also covers /playlist?list=…&v=ID, while a playlist url with
  // no video of its own correctly falls through to null.
  const fromQuery = idOrNull(url.searchParams.get('v'))
  if (fromQuery) return fromQuery

  if (segments.length >= 2 && PATH_PREFIXES.includes(segments[0].toLowerCase())) {
    return idOrNull(segments[1])
  }

  return null
}

/**
 * Thumbnail for the scene-picker tile. `mqdefault` (320×180) exists for every
 * video — the higher-res variants 404 on older uploads.
 */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
}
