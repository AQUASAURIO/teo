"use client";

import { useEffect, useState } from "react";
import { PlaylistCard } from "./PlaylistCard";

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  isPublic: boolean;
  songs: unknown[];
}

export function LibraryPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    fetch("/api/playlists")
      .then((r) => r.json())
      .then(setPlaylists)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Your Library</h1>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#B3B3B3] text-lg font-medium mb-2">
            Create your first playlist
          </p>
          <p className="text-[#B3B3B3] text-sm">
            It&apos;s easy, we&apos;ll help you
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              id={pl.id}
              name={pl.title}
              description={pl.description}
              cover={pl.coverImage}
              songCount={pl.songs?.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
