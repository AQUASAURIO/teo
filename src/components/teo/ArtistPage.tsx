"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { useViewStore } from "@/store/view-store";
import { usePlayerStore, type Song } from "@/store/player-store";
import { SongTable } from "./SongTable";
import { AlbumCard } from "./AlbumCard";
import { ArtistCard } from "./ArtistCard";
import { ContentRow } from "./ContentRow";

interface ArtistData {
  id: string;
  name: string;
  image: string;
  bio: string | null;
  songs: Song[];
  albums: Array<{ id: string; title: string; cover: string; year: number | null }>;
}

export function ArtistPage() {
  const { viewParams } = useViewStore();
  const { playSong } = usePlayerStore();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);

  const artistId = viewParams.id;
  const isLoading = artistId !== lastLoadedId;

  useEffect(() => {
    if (!artistId || artistId === lastLoadedId) return;
    fetch(`/api/artists/${artistId}`)
      .then((r) => r.json())
      .then((data) => {
        setArtist(data);
        setLastLoadedId(artistId);
      })
      .catch(() => {
        setLastLoadedId(artistId);
      });
  }, [artistId, lastLoadedId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#B3B3B3]">Artist not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${artist.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/40 to-[#121212]" />
        <div className="relative flex items-end gap-6 pb-6 pt-20 px-6">
          <div className="w-[230px] h-[230px] rounded-full overflow-hidden bg-white/5 shadow-2xl flex-shrink-0 border-2 border-white/10">
            <Image
              src={artist.image}
              alt={artist.name}
              width={230}
              height={230}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white uppercase tracking-wider mb-1">
              Artist
            </p>
            <h1 className="text-5xl font-extrabold text-white mb-4">
              {artist.name}
            </h1>
            <p className="text-[#B3B3B3] text-sm">
              {artist.songs.length} songs · {artist.albums.length} albums
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 py-6">
        <button
          onClick={() => {
            if (artist.songs.length > 0) playSong(artist.songs[0], artist.songs);
          }}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-all shadow-lg"
        >
          <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
        </button>
      </div>

      {/* Popular Songs */}
      {artist.songs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Popular</h2>
          <SongTable songs={artist.songs.slice(0, 5)} showAlbum={true} queue={artist.songs} />
        </section>
      )}

      {/* Discography */}
      {artist.albums.length > 0 && (
        <ContentRow title="Discography">
          {artist.albums.map((album) => (
            <div key={album.id} className="w-[180px] flex-shrink-0">
              <AlbumCard
                id={album.id}
                title={album.title}
                cover={album.cover}
                artistName={artist.name}
                year={album.year}
              />
            </div>
          ))}
        </ContentRow>
      )}
    </div>
  );
}
