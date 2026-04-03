"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, MoreHorizontal } from "lucide-react";
import { useViewStore } from "@/store/view-store";
import { usePlayerStore, type Song } from "@/store/player-store";
import { SongTable } from "./SongTable";

interface AlbumData {
  id: string;
  title: string;
  cover: string;
  year: number | null;
  artist: { id: string; name: string; image: string; bio?: string };
  songs: Song[];
}

export function AlbumPage() {
  const { viewParams } = useViewStore();
  const { playSong } = usePlayerStore();
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);

  const albumId = viewParams.id;
  const isLoading = albumId !== lastLoadedId;

  useEffect(() => {
    if (!albumId || albumId === lastLoadedId) return;
    fetch(`/api/albums/${albumId}`)
      .then((r) => r.json())
      .then((data) => {
        setAlbum(data);
        setLastLoadedId(albumId);
      })
      .catch(() => {
        setLastLoadedId(albumId);
      });
  }, [albumId, lastLoadedId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#B3B3B3]">Album not found</p>
      </div>
    );
  }

  const totalDuration = album.songs.reduce((acc, s) => acc + s.duration, 0);
  const mins = Math.floor(totalDuration / 60);
  const secs = totalDuration % 60;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end gap-6 mb-6">
        <div className="w-[232px] h-[232px] rounded-md overflow-hidden bg-white/5 shadow-2xl flex-shrink-0">
          <Image
            src={album.cover}
            alt={album.title}
            width={232}
            height={232}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-white uppercase tracking-wider mb-1">
            Album
          </p>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            {album.title}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => {
                const { setView } = useViewStore.getState();
                setView("artist", { id: album.artist.id });
              }}
              className="font-semibold text-white hover:underline flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10">
                <Image
                  src={album.artist.image}
                  alt={album.artist.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              {album.artist.name}
            </button>
            <span className="text-[#B3B3B3]">·</span>
            <span className="text-[#B3B3B3]">{album.year}</span>
            <span className="text-[#B3B3B3]">·</span>
            <span className="text-[#B3B3B3]">{album.songs.length} songs, {mins} min {secs} sec</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={() => {
            if (album.songs.length > 0) playSong(album.songs[0], album.songs);
          }}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-all shadow-lg"
        >
          <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
        </button>
        <button className="text-[#B3B3B3] hover:text-white transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Song Table */}
      <SongTable songs={album.songs} showAlbum={false} />
    </div>
  );
}
