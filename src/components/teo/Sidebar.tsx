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
      .catch(() => { });
  }, []);

  const navItems = [
    { icon: Home, label: "Home", view: "home" as const },
    { icon: Search, label: "Discover", view: "search" as const },
    { icon: Library, label: "Browse", view: "library" as const },
    { icon: Music, label: "Podcasts", view: "dj" as const, badge: "new" },
    { icon: Music, label: "Radio", view: "home" as const },
  ];

  return (
    <aside className="w-full h-full flex flex-col gap-6 py-8">
      {/* Logo */}
      <div className="px-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">Music</span>
        </div>
      </div>

      {/* Search Input Placeholder */}
      <div className="px-6 mb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-[#B3B3B3]">
          <Search className="w-4 h-4" />
          <span className="text-sm">Search ...</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 px-4">
        <span className="px-4 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Menu</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.view === "home" || item.view === "search" || item.view === "library" || item.view === "dj") {
                  setView(item.view);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={isActive ? "text-primary shadow-[0_0_15px_rgba(255,77,77,0.5)]" : ""}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase tracking-tighter border border-primary/20 leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Library Section */}
      <div className="flex flex-col gap-1 px-4 mt-4">
        <span className="px-4 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center justify-between">
          Library
          <button onClick={onCreatePlaylist} className="hover:text-white transition-colors">
            <Plus className="w-3 h-3" />
          </button>
        </span>

        <button
          onClick={() => setView("library")}
          className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Music className="w-5 h-5 text-white/40" />
          <span className="text-sm font-medium tracking-wide">Albums</span>
        </button>
        <button
          className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Music className="w-5 h-5 text-white/40" />
          <span className="text-sm font-medium tracking-wide">Song</span>
        </button>
        <button
          className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Music className="w-5 h-5 text-white/40" />
          <span className="text-sm font-medium tracking-wide">Artists</span>
        </button>
      </div>

      {/* User Info at the bottom */}
      <div className="mt-auto px-6 py-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden glass border border-white/10">
            <Image src="/teo-logo.png" alt="User" width={40} height={40} className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Vitaliy Dorozhko</span>
            <span className="text-[10px] text-white/40">Premium member</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
