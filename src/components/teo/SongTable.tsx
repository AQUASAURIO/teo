"use client";

import { type Song } from "@/store/player-store";
import { SongRow } from "./SongRow";

interface SongTableProps {
  songs: Song[];
  showAlbum?: boolean;
  queue?: Song[];
}

export function SongTable({ songs, showAlbum = true, queue }: SongTableProps) {
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#B3B3B3] text-sm">No songs found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        className="grid items-center gap-4 px-4 py-2 border-b border-white/10 mb-2 text-[#B3B3B3] text-xs uppercase tracking-wider"
        style={{
          gridTemplateColumns: showAlbum
            ? "16px 4fr 3fr 1fr 40px"
            : "16px 4fr 3fr 40px",
        }}
      >
        <span className="text-center">#</span>
        <span>Title</span>
        {showAlbum && <span>Album</span>}
        <span className="text-right">Duration</span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {songs.map((song, index) => (
          <SongRow
            key={song.id}
            song={song}
            index={index}
            showAlbum={showAlbum}
            queue={queue || songs}
          />
        ))}
      </div>
    </div>
  );
}
