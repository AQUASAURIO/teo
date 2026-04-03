"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useViewStore } from "@/store/view-store";

interface AlbumCardProps {
  id: string;
  title: string;
  cover: string;
  artistName: string;
  year?: number | null;
  songCount?: number;
}

export function AlbumCard({ id, title, cover, artistName, year }: AlbumCardProps) {
  const { setView } = useViewStore();

  return (
    <button
      onClick={() => setView("album", { id })}
      className="album-card group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-300 text-left w-full"
    >
      <div className="relative mb-4">
        <div className="aspect-square rounded-md overflow-hidden bg-white/5 shadow-lg">
          <Image
            src={cover}
            alt={title}
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="card-play-btn absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl shadow-black/40">
          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
        </div>
      </div>
      <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
      <p className="text-[#B3B3B3] text-xs mt-1 truncate">
        {year ? `${year} · ` : ""}{artistName}
      </p>
    </button>
  );
}
