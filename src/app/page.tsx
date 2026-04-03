"use client";

import { Sidebar } from "@/components/teo/Sidebar";
import { TopBar } from "@/components/teo/TopBar";
import { NowPlayingBar } from "@/components/teo/NowPlayingBar";
import { HomePage } from "@/components/teo/HomePage";
import { SearchPage } from "@/components/teo/SearchPage";
import { LibraryPage } from "@/components/teo/LibraryPage";
import { PlaylistPage } from "@/components/teo/PlaylistPage";
import { ArtistPage } from "@/components/teo/ArtistPage";
import { AlbumPage } from "@/components/teo/AlbumPage";
import { SettingsPage } from "@/components/teo/SettingsPage";
import { DJMixPage } from "@/components/teo/DJMixPage";
import { useViewStore } from "@/store/view-store";
import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function CreatePlaylistDialog({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, description: description || null }),
      });
      setName("");
      setDescription("");
      setOpen(false);
      // Refresh playlists - trigger a re-render
      window.dispatchEvent(new CustomEvent("playlist-created"));
    } catch {
      // Error handled silently
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-[#282828] border-white/10 text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-[#B3B3B3] mb-1 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Playlist"
              className="bg-white/10 border-white/10 text-white placeholder-[#B3B3B3]"
            />
          </div>
          <div>
            <label className="text-sm text-[#B3B3B3] mb-1 block">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              className="bg-white/10 border-white/10 text-white placeholder-[#B3B3B3]"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MainContent() {
  const { currentView } = useViewStore();

  switch (currentView) {
    case "home":
      return <HomePage />;
    case "search":
      return <SearchPage />;
    case "library":
      return <LibraryPage />;
    case "playlist":
      return <PlaylistPage />;
    case "artist":
      return <ArtistPage />;
    case "album":
      return <AlbumPage />;
    case "settings":
      return <SettingsPage />;
    case "dj":
      return <DJMixPage />;
    default:
      return <HomePage />;
  }
}

export default function TeoApp() {
  const handleCreatePlaylist = useCallback(() => {
    // Dialog is handled by CreatePlaylistDialog component
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#121212] overflow-hidden">
      <div className="flex flex-1 gap-2 p-2 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 h-full rounded-lg overflow-hidden bg-black">
          <Sidebar onCreatePlaylist={handleCreatePlaylist} />
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-[#121212] rounded-lg overflow-hidden flex flex-col">
          <TopBar />
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <MainContent />
          </div>
        </main>
      </div>

      {/* Now Playing Bar */}
      <NowPlayingBar />
    </div>
  );
}
