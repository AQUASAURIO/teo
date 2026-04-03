"use client";

import { Play } from "lucide-react";
import { usePlayerStore, type Song } from "@/store/player-store";
import Image from "next/image";

interface SongRowProps {
  song: Song;
  index: number;
  showAlbum?: boolean;
  queue?: Song[];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const sourceBadgeStyles: Record<string, string> = {
  local: "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/30",
  youtube: "bg-[#FF0000]/20 text-[#FF4444] border-[#FF0000]/30",
  itunes: "bg-[#007AFF]/20 text-[#007AFF] border-[#007AFF]/30",
  deezer: "bg-[#A238FF]/20 text-[#A238FF] border-[#A238FF]/30",
};

const sourceLabels: Record<string, string> = {
  local: "TEO",
  youtube: "YT",
  itunes: "iT",
  deezer: "DZ",
};

export function SongRow({ song, index, showAlbum = true, queue }: SongRowProps) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const isCurrentSong = currentSong?.id === song.id;
  const sourceKey = song.source || "local";

  return (
    <div
      className={`song-row group grid items-center gap-4 px-4 py-2 rounded-md cursor-pointer ${
        isCurrentSong ? "bg-white/10" : ""
      }`}
      style={{
        gridTemplateColumns: showAlbum
          ? "16px 4fr 3fr 1fr 40px"
          : "16px 4fr 3fr 40px",
      }}
      onDoubleClick={() => playSong(song, queue)}
    >
      {/* Number / Play button */}
      <div className="flex items-center justify-center w-4">
        <span className="song-row-number text-sm text-[#B3B3B3] tabular-nums">
          {index + 1}
        </span>
        <button
          className="song-row-play hidden items-center justify-center text-white"
          onClick={() => playSong(song, queue)}
        >
          {isCurrentSong && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: "60%", animationDelay: "0ms" }} />
              <div className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
              <div className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
            </div>
          ) : (
            <Play className="w-3.5 h-3.5" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Title & Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={song.cover}
          alt={song.title}
          width={40}
          height={40}
          className="rounded flex-shrink-0"
        />
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate flex items-center gap-2 ${isCurrentSong ? "text-[#1DB954]" : "text-white"}`}>
            {song.title}
            <span
              className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-semibold leading-none flex-shrink-0 ${sourceBadgeStyles[sourceKey] || ""}`}
            >
              {sourceLabels[sourceKey] || sourceKey}
            </span>
          </p>
          <button
            className="text-xs text-[#B3B3B3] truncate hover:underline block text-left"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {song.artist?.name ?? "Unknown Artist"}
          </button>
        </div>
      </div>

      {/* Album */}
      {showAlbum && song.album && (
        <span className="text-sm text-[#B3B3B3] truncate">{song.album.title}</span>
      )}

      {/* Duration */}
      <span className="text-sm text-[#B3B3B3] tabular-nums text-right">
        {song.duration > 0 ? formatDuration(song.duration) : "--:--"}
      </span>
    </div>
  );
}
