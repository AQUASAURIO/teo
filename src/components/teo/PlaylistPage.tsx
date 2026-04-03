"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Clock } from "lucide-react";
import { useViewStore } from "@/store/view-store";
import { usePlayerStore, type Song } from "@/store/player-store";
import { SongTable } from "./SongTable";

interface PlaylistData {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  user: { id: string; name: string; image: string | null };
  songs: Song[];
}

export function PlaylistPage() {
  const { viewParams } = useViewStore();
  const { playSong } = usePlayerStore();
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);

  const playlistId = viewParams.id;
  const isLoading = playlistId !== lastLoadedId;

  useEffect(() => {
    if (!playlistId || playlistId === lastLoadedId) return;
    fetch(`/api/playlists/${playlistId}`)
      .then((r) => r.json())
      .then((data) => {
        setPlaylist(data);
        setLastLoadedId(playlistId);
      })
      .catch(() => {
        setLastLoadedId(playlistId);
      });
  }, [playlistId, lastLoadedId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#B3B3B3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#B3B3B3]">Playlist not found</p>
      </div>
    );
  }

  const songs: Song[] = playlist.songs;
  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end gap-6 mb-6">
        <div className="w-[232px] h-[232px] rounded-md overflow-hidden bg-white/5 shadow-2xl flex-shrink-0">
          {playlist.coverImage ? (
            <Image
              src={playlist.coverImage}
              alt={playlist.title}
              width={232}
              height={232}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1DB954] to-[#14833b] flex items-center justify-center">
              <Play className="w-16 h-16 text-white" fill="white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-white uppercase tracking-wider mb-1">
            Playlist
          </p>
          <h1 className="text-5xl font-extrabold text-white mb-4 truncate">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-[#B3B3B3] text-sm mb-2">{playlist.description}</p>
          )}
          <div className="flex items-center gap-1 text-sm text-[#B3B3B3]">
            <span className="font-semibold text-white">{playlist.user.name}</span>
            <span>·</span>
            <span>{songs.length} songs, about {hours > 0 ? `${hours} hr ` : ""}{mins} min</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={() => {
            if (songs.length > 0) playSong(songs[0], songs);
          }}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-all shadow-lg"
        >
          <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
        </button>
        <Clock className="w-5 h-5 text-[#B3B3B3]" />
      </div>

      {/* Song Table */}
      <SongTable songs={songs} />
    </div>
  );
}
