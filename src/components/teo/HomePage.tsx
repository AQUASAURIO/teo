"use client";

import { useEffect, useState } from "react";
import { ContentRow } from "./ContentRow";
import { PlaylistCard } from "./PlaylistCard";
import { ArtistCard } from "./ArtistCard";
import { AlbumCard } from "./AlbumCard";
import { MiniSongCard } from "./MiniSongCard";
import { Play, ChevronLeft, User } from "lucide-react";
import { usePlayerStore, type Song } from "@/store/player-store";
import { useViewStore } from "@/store/view-store";
import { SongTable } from "./SongTable";

interface HomeData {
  playlists: Array<{ id: string; title: string; description: string | null; coverImage: string | null; songs: unknown[] }>;
  trendingSongs: Song[];
  newReleases: Array<{ id: string; title: string; cover: string; artist: { id: string; name: string; image: string }; year: number | null }>;
  popularArtists: Array<{ id: string; name: string; image: string; _count: { songs: number } }>;
}

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const { playSong } = usePlayerStore();
  const { setView } = useViewStore();

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(() => { });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex items-center gap-3 text-white/50">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Syncing with your vibes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6">
      {/* Search Header (Small) */}
      <div className="flex items-center gap-4 text-white/40 mb-8">
        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors rotate-180">
          <ChevronLeft className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium ml-4">What's hot</span>
      </div>

      {/* Trending Banner */}
      <section className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden group">
        <div className="absolute inset-0 trending-banner transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="relative h-full flex flex-col justify-end p-10 md:p-14 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest font-mono">Artist</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white max-w-lg leading-[1.1]">
            Top all over the world
          </h2>
          <div className="flex items-center gap-6 text-white/80 text-sm mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-semibold">Montly listener</span>
            </div>
            <span className="font-bold">• 98.029</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const song = data.trendingSongs[0];
                if (song) playSong(song, data.trendingSongs);
              }}
              className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Play Now
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-bold transition-all border border-white/10">
              Follow
            </button>
          </div>
        </div>
      </section>

      {/* Playlist Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-4xl font-bold text-white tracking-tight">Playlist</h3>
          <button className="text-white/40 text-sm font-medium hover:text-white transition-colors">Show all</button>
        </div>
        <div className="glass rounded-[2rem] overflow-hidden p-6 border border-white/5">
          <SongTable songs={data.trendingSongs.slice(0, 4)} queue={data.trendingSongs} />
        </div>
      </section>

      {/* Browsing Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ContentRow title="Discover New" orientation="vertical">
          {data.newReleases.slice(0, 3).map((album) => (
            <div key={album.id} className="w-full">
              <ArtistCard
                id={album.id}
                name={album.title}
                image={album.cover}
                songCount={1} // Placeholder
              />
            </div>
          ))}
        </ContentRow>

        <ContentRow title="Your Library" orientation="vertical">
          {data.playlists.slice(0, 3).map((pl) => (
            <div key={pl.id} className="w-full">
              <PlaylistCard
                id={pl.id}
                name={pl.title}
                description={pl.description}
                cover={pl.coverImage}
              />
            </div>
          ))}
        </ContentRow>
      </div>
    </div>
  );
}

