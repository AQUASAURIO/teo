"use client";

import { useEffect, useState } from "react";
import { ContentRow } from "./ContentRow";
import { PlaylistCard } from "./PlaylistCard";
import { ArtistCard } from "./ArtistCard";
import { AlbumCard } from "./AlbumCard";
import { MiniSongCard } from "./MiniSongCard";
import { Play } from "lucide-react";
import { usePlayerStore, type Song } from "@/store/player-store";
import { useViewStore } from "@/store/view-store";

interface HomeData {
  playlists: Array<{ id: string; title: string; description: string | null; coverImage: string | null; songs: unknown[] }>;
  trendingSongs: Song[];
  newReleases: Array<{ id: string; title: string; cover: string; artist: { id: string; name: string; image: string }; year: number | null }>;
  popularArtists: Array<{ id: string; name: string; image: string; _count: { songs: number } }>;
}

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [greeting, setGreeting] = useState("");
  const { playSong } = usePlayerStore();

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(() => { });

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#B3B3B3]">
          <div className="w-5 h-5 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Greeting */}
      <h1 className="text-3xl font-bold text-white mb-6 h-9">{greeting}</h1>

      {/* Quick Play Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {data.playlists.slice(0, 6).map((pl) => (
          <button
            key={pl.id}
            className="flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden group transition-colors"
            onClick={() => {
              const queue = data.trendingSongs;
              if (queue.length > 0) playSong(queue[0], queue);
            }}
          >
            {pl.coverImage ? (
              <img src={pl.coverImage} alt={pl.title} className="w-16 h-16 object-cover" />
            ) : (
              <div className="w-16 h-16 bg-[#1DB954] flex items-center justify-center">
                <Play className="w-6 h-6 text-black" fill="black" />
              </div>
            )}
            <span className="text-white font-semibold text-sm px-4 truncate flex-1 text-left">
              {pl.title}
            </span>
            <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center mr-3 opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-black/30">
              <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
            </div>
          </button>
        ))}
      </div>

      {/* Featured Playlists */}
      <ContentRow title="Featured Playlists">
        {data.playlists.map((pl) => (
          <div key={pl.id} className="w-[180px] flex-shrink-0">
            <PlaylistCard
              id={pl.id}
              name={pl.title}
              description={pl.description}
              cover={pl.coverImage}
              songCount={pl.songs?.length}
            />
          </div>
        ))}
      </ContentRow>

      {/* Trending Songs */}
      <ContentRow title="Trending Now">
        {data.trendingSongs.map((song) => (
          <div key={song.id} className="w-[280px] flex-shrink-0">
            <MiniSongCard song={song} queue={data.trendingSongs} />
          </div>
        ))}
      </ContentRow>

      {/* New Releases */}
      <ContentRow title="New Releases">
        {data.newReleases.map((album) => (
          <div key={album.id} className="w-[180px] flex-shrink-0">
            <AlbumCard
              id={album.id}
              title={album.title}
              cover={album.cover}
              artistName={album.artist.name}
              year={album.year}
            />
          </div>
        ))}
      </ContentRow>

      {/* Popular Artists */}
      <ContentRow title="Popular Artists">
        {data.popularArtists.map((artist) => (
          <div key={artist.id} className="w-[180px] flex-shrink-0">
            <ArtistCard
              id={artist.id}
              name={artist.name}
              image={artist.image}
              songCount={artist._count?.songs}
            />
          </div>
        ))}
      </ContentRow>
    </div>
  );
}
