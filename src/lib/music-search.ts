// Unified music search gateway that queries multiple free APIs in parallel
// Providers: YouTube (internal), iTunes, Deezer

export interface UnifiedTrack {
  id: string;
  source: "youtube" | "itunes" | "deezer";
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
}

// ── Internal provider interfaces ──

interface YouTubeInternalItem {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
}

interface ITunesResult {
  resultCount: number;
  results: ITunesTrack[];
}

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMs: number;
  kind: string;
  wrapperType: string;
}

interface DeezerResult {
  total: number;
  data: DeezerTrack[];
}

interface DeezerTrack {
  id: number;
  title: string;
  artist: { name: string; id: number };
  album: { cover_medium: string; cover_big: string; title: string };
  preview: string;
  duration: number;
  type: string;
}

// ── Helper: string similarity for deduplication ──

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;

  // Simple trigram similarity
  const trigramsA = new Set<string>();
  const trigramsB = new Set<string>();
  for (let i = 0; i < na.length - 2; i++) trigramsA.add(na.slice(i, i + 3));
  for (let i = 0; i < nb.length - 2; i++) trigramsB.add(nb.slice(i, i + 3));

  let intersection = 0;
  for (const t of trigramsA) {
    if (trigramsB.has(t)) intersection++;
  }
  const union = trigramsA.size + trigramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function isDuplicate(
  track: UnifiedTrack,
  existing: UnifiedTrack[],
  threshold: number = 0.6
): boolean {
  return existing.some(
    (e) =>
      e.source !== track.source &&
      similarity(e.title + " " + e.artist, track.title + " " + track.artist) >= threshold
  );
}

// ── Provider: YouTube (calls internal /api/youtube) ──

async function searchYouTube(
  query: string,
  limit: number,
  baseUrl: string
): Promise<UnifiedTrack[]> {
  try {
    const res = await fetch(
      `${baseUrl}/api/youtube?q=${encodeURIComponent(query)}&max=${limit}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const items: YouTubeInternalItem[] = data.items || [];

    return items.map((item) => ({
      id: `yt-${item.videoId}`,
      source: "youtube" as const,
      title: item.title,
      artist: item.channel.replace(/ - Topic$/, ""),
      cover: item.thumbnail || "",
      audioUrl: item.videoId, // stored as videoId for iframe player
      duration: 0,
    }));
  } catch {
    return [];
  }
}

// ── Provider: iTunes ──

async function searchITunes(
  query: string,
  limit: number
): Promise<UnifiedTrack[]> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}`,
      {
        headers: { "User-Agent": "TeoMusic/1.0" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];

    const data: ITunesResult = await res.json();

    return (data.results || [])
      .filter((t: ITunesTrack) => t.kind === "song" && t.previewUrl)
      .map((t: ITunesTrack) => ({
        id: `it-${t.trackId}`,
        source: "itunes" as const,
        title: t.trackName,
        artist: t.artistName,
        cover: (t.artworkUrl100 || "").replace("100x100bb", "300x300bb"),
        audioUrl: t.previewUrl,
        duration: Math.round((t.trackTimeMs || 0) / 1000),
      }));
  } catch {
    return [];
  }
}

// ── Provider: Deezer ──

async function searchDeezer(
  query: string,
  limit: number
): Promise<UnifiedTrack[]> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: { "User-Agent": "TeoMusic/1.0" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];

    const data: DeezerResult = await res.json();

    return (data.data || []).map((t: DeezerTrack) => ({
      id: `dz-${t.id}`,
      source: "deezer" as const,
      title: t.title,
      artist: t.artist?.name || "Unknown",
      cover: t.album?.cover_medium || "",
      audioUrl: t.preview || "",
      duration: t.duration || 0,
    }));
  } catch {
    return [];
  }
}

// ── Main search function ──

export async function searchAllSources(
  query: string,
  limit: number = 8
): Promise<{ results: UnifiedTrack[]; sources: string[] }> {
  if (!query.trim()) return { results: [], sources: [] };

  // Determine base URL for internal YouTube API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Search all providers in parallel
  const [ytResult, itunesResult, deezerResult] = await Promise.allSettled([
    searchYouTube(query, limit, baseUrl),
    searchITunes(query, limit),
    searchDeezer(query, limit),
  ]);

  const ytTracks: UnifiedTrack[] =
    ytResult.status === "fulfilled" ? ytResult.value : [];
  const itunesTracks: UnifiedTrack[] =
    itunesResult.status === "fulfilled" ? itunesResult.value : [];
  const deezerTracks: UnifiedTrack[] =
    deezerResult.status === "fulfilled" ? deezerResult.value : [];

  // Merge and deduplicate — keep order: YouTube → iTunes → Deezer
  const merged: UnifiedTrack[] = [];
  const sources: string[] = [];

  if (ytTracks.length > 0) sources.push("youtube");
  if (itunesTracks.length > 0) sources.push("itunes");
  if (deezerTracks.length > 0) sources.push("deezer");

  for (const track of [...ytTracks, ...itunesTracks, ...deezerTracks]) {
    if (!isDuplicate(track, merged)) {
      merged.push(track);
    }
  }

  return { results: merged.slice(0, limit * 3), sources };
}
