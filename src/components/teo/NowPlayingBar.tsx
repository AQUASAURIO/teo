"use client";

import { usePlayerStore } from "@/store/player-store";
import { useViewStore } from "@/store/view-store";
import { getAudioSeekTo } from "@/components/teo/PlayerProvider";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Heart,
  Youtube,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NowPlayingBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeatMode,
    togglePlay,
    setVolume,
    nextSong,
    prevSong,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();
  const { setView } = useViewStore();

  const [isLiked, setIsLiked] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = percent * duration;
      const seekTo = getAudioSeekTo();
      if (seekTo) {
        seekTo(time);
      }
    },
    [duration]
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleProgressClick(e);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
        const time = percent * duration;
        const seekTo = getAudioSeekTo();
        if (seekTo) {
          seekTo(time);
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [duration, handleProgressClick]
  );

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(percent);
    },
    [setVolume]
  );

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!currentSong) {
    return (
      <footer className="h-[90px] bg-[#181818] border-t border-white/5 flex items-center justify-center">
        <p className="text-[#B3B3B3] text-sm">Select a song to start playing</p>
      </footer>
    );
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="h-[90px] bg-[#181818] border-t border-white/5 flex items-center px-4 gap-4">
      {/* Left: Song Info */}
      <div className="flex items-center gap-3 w-[280px] min-w-[200px]">
        <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-white/5">
          <Image
            src={currentSong.cover}
            alt={currentSong.title}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              className="block text-white text-sm font-medium truncate hover:underline"
              onClick={() => {
                if (currentSong.albumId) {
                  setView("album", { id: currentSong.albumId });
                }
              }}
            >
              {currentSong.title}
            </button>
            {currentSong.source === "youtube" && (
              <Youtube className="w-3 h-3 text-[#FF0000] flex-shrink-0" />
            )}
          </div>
          <button
            className="block text-[#B3B3B3] text-xs truncate hover:underline hover:text-white"
            onClick={() => {
              setView("artist", { id: currentSong.artistId });
            }}
          >
            {currentSong.artist.name}
          </button>
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex-shrink-0 transition-colors ${isLiked ? "text-[#1DB954]" : "text-[#B3B3B3] hover:text-white"}`}
        >
          <Heart className="w-4 h-4" fill={isLiked ? "#1DB954" : "none"} />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[722px]">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              shuffle ? "text-[#1DB954]" : "text-[#B3B3B3] hover:text-white"
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={prevSong}
            className="text-[#B3B3B3] hover:text-white transition-colors"
          >
            <SkipBack className="w-4 h-4" fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-black" fill="black" />
            ) : (
              <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="text-[#B3B3B3] hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`transition-colors relative ${
              repeatMode !== "off" ? "text-[#1DB954]" : "text-[#B3B3B3] hover:text-white"
            }`}
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== "off" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[#B3B3B3] text-xs min-w-[40px] text-right tabular-nums">
            {formatTime(progress)}
          </span>
          <div
            ref={progressRef}
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group relative"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className="h-full bg-white group-hover:bg-[#1DB954] rounded-full relative transition-colors"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
          <span className="text-[#B3B3B3] text-xs min-w-[40px] tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Queue */}
      <div className="flex items-center gap-2 w-[280px] min-w-[200px] justify-end">
        <button className="text-[#B3B3B3] hover:text-white transition-colors">
          <ListMusic className="w-4 h-4" />
        </button>
        <button
          onClick={toggleMute}
          className="text-[#B3B3B3] hover:text-white transition-colors"
        >
          <VolumeIcon className="w-4 h-4" />
        </button>
        <div
          className="w-24 h-1 bg-white/20 rounded-full cursor-pointer group relative"
          onClick={handleVolumeClick}
        >
          <div
            className="h-full bg-white group-hover:bg-[#1DB954] rounded-full relative transition-colors"
            style={{ width: `${volume * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
          </div>
        </div>
      </div>
    </footer>
  );
}
