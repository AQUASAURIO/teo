"use client";

import { Play } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import type { Song } from "@/store/player-store";

interface MiniSongCardProps {
  song: Song;
  queue?: Song[];
}

export function MiniSongCard({ song, queue }: MiniSongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;

  return (
    <button
      onClick={() => playSong(song, queue)}
      className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors w-full text-left"
    >
      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-white/5">
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: "60%", animationDelay: "0ms" }} />
              <div className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
              <div className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
            </div>
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isCurrent ? "text-[#1DB954]" : "text-white"}`}>
          {song.title}
        </p>
        <p className="text-xs text-[#B3B3B3] truncate">{song.artist.name}</p>
      </div>
    </button>
  );
}
