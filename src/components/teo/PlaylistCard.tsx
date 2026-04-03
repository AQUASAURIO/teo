"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useViewStore } from "@/store/view-store";

interface PlaylistCardProps {
  id: string;
  name: string;
  description?: string | null;
  cover: string | null;
  songCount?: number;
}

export function PlaylistCard({ id, name, description, cover, songCount }: PlaylistCardProps) {
  const { setView } = useViewStore();

  return (
    <button
      onClick={() => setView("playlist", { id })}
      className="playlist-card group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-300 text-left w-full"
    >
      <div className="relative mb-4">
        <div className="aspect-square rounded-md overflow-hidden bg-white/5 shadow-lg">
          {cover ? (
            <Image
              src={cover}
              alt={name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1DB954] to-[#14833b] flex items-center justify-center">
              <Play className="w-12 h-12 text-white" fill="white" />
            </div>
          )}
        </div>
        <div className="card-play-btn absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl shadow-black/40">
          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
        </div>
      </div>
      <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
      <p className="text-[#B3B3B3] text-xs mt-1 line-clamp-2">
        {description || (songCount ? `${songCount} songs` : "")}
      </p>
    </button>
  );
}
