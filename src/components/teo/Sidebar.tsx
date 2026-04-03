"use client";

import Image from "next/image";
import { Home, Search, Library, Plus, Music, Disc3 } from "lucide-react";
import { useViewStore } from "@/store/view-store";
import { useEffect, useState } from "react";

interface Playlist {
  id: string;
  title: string;
  coverImage: string | null;
}

interface SidebarProps {
  onCreatePlaylist: () => void;
}

export function Sidebar({ onCreatePlaylist }: SidebarProps) {
  const { currentView, setView } = useViewStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((data) => setPlaylists(data))
      .catch(() => {});
  }, []);

  const navItems = [
    { icon: Home, label: "Home", view: "home" as const },
    { icon: Search, label: "Search", view: "search" as const },
    { icon: Library, label: "Your Library", view: "library" as const },
    { icon: Disc3, label: "DJ Mix", view: "dj" as const },
  ];

  return (
    <aside className="w-[280px] min-w-[280px] h-full flex flex-col gap-2 bg-black">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-white font-bold text-xl">Teo</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => {
                if (item.view === "home" || item.view === "search" || item.view === "library" || item.view === "dj") {
                  setView(item.view);
                }
              }}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                isActive ? "text-white" : "text-[#B3B3B3] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-2 border-t border-white/10" />

      {/* Playlists Section */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[#B3B3B3] text-xs font-semibold tracking-wider uppercase">
            Playlists
          </span>
          <button
            onClick={onCreatePlaylist}
            className="text-[#B3B3B3] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-0.5">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setView("playlist", { id: pl.id })}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-[#B3B3B3] hover:text-white transition-colors truncate"
            >
              {pl.coverImage ? (
                <Image
                  src={pl.coverImage}
                  alt={pl.title}
                  width={32}
                  height={32}
                  className="rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4 text-[#B3B3B3]" />
                </div>
              )}
              <span className="truncate">{pl.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
