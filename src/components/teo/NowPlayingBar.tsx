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
    <footer className="h-[100px] glass rounded-[2.5rem] flex items-center px-8 gap-8 border border-white/10 shadow-2xl">
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-[300px] min-w-[240px]">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/5 shadow-lg">
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
              className="block text-white text-base font-bold truncate hover:underline"
              onClick={() => {
                if (currentSong.albumId) {
                  setView("album", { id: currentSong.albumId });
                }
              }}
            >
              {currentSong.title}
            </button>
            {currentSong.source === "youtube" && (
              <Youtube className="w-3 h-3 text-primary flex-shrink-0" />
            )}
          </div>
          <button
            className="block text-white/40 text-xs font-medium truncate hover:underline hover:text-white"
            onClick={() => {
              setView("artist", { id: currentSong.artistId });
            }}
          >
            {currentSong.artist.name}
          </button>
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex-shrink-0 transition-all transform hover:scale-110 ${isLiked ? "text-primary" : "text-white/20 hover:text-white/40"}`}
        >
          <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex-1 flex flex-col items-center gap-3">
        {/* Playback controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? "text-primary" : "text-white/40 hover:text-white"
              }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevSong}
            className="text-white/80 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-white/10"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black" fill="black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-1" fill="black" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="text-white/80 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition-colors ${repeatMode !== "off" ? "text-primary" : "text-white/40 hover:text-white"
              }`}
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress bar area */}
        <div className="flex items-center gap-3 w-full max-w-[600px]">
          <span className="text-white/30 text-[10px] font-bold min-w-[35px] text-right tabular-nums tracking-widest">
            {formatTime(progress)}
          </span>
          <div
            ref={progressRef}
            className="flex-1 h-1.5 bg-white/5 rounded-full cursor-pointer group relative overflow-hidden border border-white/5"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className={`h-full bg-white rounded-full relative transition-all duration-150 ${isDragging ? "" : ""}`}
              style={{ width: `${progressPercent}%` }}
            />
            {/* Hover indicator (thumb line replacement) */}
            <div
              className="absolute h-full w-0.5 bg-white top-0"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <span className="text-white/30 text-[10px] font-bold min-w-[35px] tabular-nums tracking-widest">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Extra Controls */}
      <div className="flex items-center gap-6 w-[300px] min-w-[240px] justify-end">
        <div className="flex items-center gap-3 group">
          <VolumeIcon className="w-4 h-4 text-white/40 group-hover:text-white transition-colors cursor-pointer" onClick={toggleMute} />
          <div
            className="w-24 h-1 bg-white/10 rounded-full cursor-pointer group/vol relative border border-white/5"
            onClick={handleVolumeClick}
          >
            <div
              className="h-full bg-white rounded-full relative transition-all"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
        <button className="text-white/40 hover:text-white transition-colors">
          <ListMusic className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}
