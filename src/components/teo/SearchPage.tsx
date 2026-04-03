"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { SearchInput } from "./SearchInput";
import { SongTable } from "./SongTable";
import { ArtistCard } from "./ArtistCard";
import { AlbumCard } from "./AlbumCard";
import { Loader2 } from "lucide-react";
import type { Song } from "@/store/player-store";

interface SearchResult {
  songs: Song[];
  artists: Array<{ id: string; name: string; image: string; _count: { songs: number; albums: number } }>;
  albums: Array<{ id: string; title: string; cover: string; artist: { id: string; name: string; image: string }; _count: { songs: number } }>;
}

interface UnifiedTrack {
  id: string;
  source: "youtube" | "itunes" | "deezer";
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
}

interface MusicSearchResponse {
  results: UnifiedTrack[];
  sources: string[];
}

const genres = [
  { name: "Pop", color: "#8C67AB" },
  { name: "Hip-Hop", color: "#BA5D07" },
  { name: "Rock", color: "#E61E32" },
  { name: "Electronic", color: "#DC148C" },
  { name: "R&B", color: "#1E3264" },
  { name: "Jazz", color: "#477D95" },
  { name: "Classical", color: "#7D4B32" },
  { name: "Indie", color: "#608108" },
  { name: "Ambient", color: "#1E3264" },
  { name: "Folk", color: "#8C67AB" },
  { name: "Metal", color: "#E61E32" },
  { name: "Lo-Fi", color: "#477D95" },
];

/** Convert a UnifiedTrack from the multi-API search into a Song for the player */
function unifiedTrackToSong(track: UnifiedTrack): Song {
  return {
    id: track.id,
    title: track.title,
    duration: track.duration,
    cover: track.cover,
    audioUrl: track.audioUrl,
    artistId: `ext-${track.source}-${track.artist}`,
    artist: { id: `ext-${track.source}-${track.artist}`, name: track.artist, image: "" },
    albumId: null,
    album: null,
    source: track.source,
  };
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [externalTracks, setExternalTracks] = useState<UnifiedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "songs" | "artists" | "albums">("all");

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setExternalTracks([]);
      return;
    }
    setLoading(true);

    try {
      const [localRes, musicRes] = await Promise.allSettled([
        fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json()),
        fetch(`/api/music-search?q=${encodeURIComponent(q)}`).then((r) => r.json()),
      ]);

      if (localRes.status === "fulfilled") {
        setResults(localRes.value);
      } else {
        setResults(null);
      }

      if (musicRes.status === "fulfilled") {
        const data: MusicSearchResponse = musicRes.value;
        setExternalTracks(data.results || []);
      } else {
        setExternalTracks([]);
      }
    } catch {
      setResults(null);
      setExternalTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Merge results: local songs first, then cross-platform results
  const allSongs: Song[] = useMemo(() => {
    const localSongs: Song[] = (results?.songs || []).map((s) => ({
      ...s,
      source: (s.source || "local") as Song["source"],
    }));
    const externalSongs = externalTracks.map(unifiedTrackToSong);
    return [...localSongs, ...externalSongs];
  }, [results, externalTracks]);

  const hasLocalResults = results && (results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0);
  const hasExternalResults = externalTracks.length > 0;
  const hasAnyResults = hasLocalResults || hasExternalResults;

  const tabs: Array<"all" | "songs" | "artists" | "albums"> = ["all", "songs", "artists", "albums"];

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />

      {!query && !results && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">Browse all</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.name}
                className="relative h-[180px] rounded-lg overflow-hidden cursor-pointer group"
                style={{ backgroundColor: genre.color }}
              >
                <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl">
                  {genre.name}
                </h3>
                <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-white/20 rounded-full rotate-[25deg] group-hover:scale-110 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasAnyResults && (
        <div className="mt-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Artists */}
          {(activeTab === "all" || activeTab === "artists") && results && results.artists.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Artists</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    id={artist.id}
                    name={artist.name}
                    image={artist.image}
                    songCount={artist._count?.songs}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeTab === "all" || activeTab === "albums") && results && results.albums.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Albums</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    id={album.id}
                    title={album.title}
                    cover={album.cover}
                    artistName={album.artist.name}
                    songCount={album._count?.songs}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Songs — local results first, then YouTube/iTunes/Deezer */}
          {(activeTab === "all" || activeTab === "songs") && allSongs.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Songs</h3>
              <SongTable songs={allSongs} />
            </section>
          )}

          {!loading && !hasAnyResults && query && (
            <div className="text-center py-12">
              <p className="text-[#B3B3B3] text-lg font-medium">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-[#B3B3B3] text-sm mt-2">
                Check your spelling, or try different keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
