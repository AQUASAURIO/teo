"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore, type Song } from "@/store/player-store";

// YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height: string;
          width: string;
          videoId: string;
          playerVars: {
            autoplay: number;
            controls: number;
            disablekb: number;
            fs: number;
            modestbranding: number;
            rel: number;
            origin: string;
          };
          events: {
            onReady: (event: { target: YTPlayer }) => void;
            onStateChange: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
      };
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ytReadyRef = useRef(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const nextSong = usePlayerStore((s) => s.nextSong);

  const isYouTube = currentSong?.source === "youtube";
  const videoId = isYouTube ? currentSong.audioUrl : null;

  // Stop progress polling
  const stopProgressPolling = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Start progress polling for YouTube
  const startYTProgressPolling = useCallback(() => {
    stopProgressPolling();
    progressIntervalRef.current = setInterval(() => {
      const player = ytPlayerRef.current;
      if (player && typeof player.getCurrentTime === "function") {
        const ct = player.getCurrentTime();
        const dur = player.getDuration();
        if (isFinite(ct)) setProgress(ct);
        if (isFinite(dur)) setDuration(dur);
      }
    }, 250);
  }, [setProgress, setDuration, stopProgressPolling]);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure the player div exists inside our container ref
    // We handle this manually to keep it out of React's child reconciliation
    if (containerRef.current && !document.getElementById("yt-player-div")) {
      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-player-div";
      containerRef.current.appendChild(playerDiv);
    }

    if (document.getElementById("youtube-iframe-api")) {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        initPlayer();
      }
      return;
    }

    const tag = document.createElement("script");
    tag.id = "youtube-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    function initPlayer() {
      if (!window.YT || !window.YT.Player || ytPlayerRef.current) return;

      ytPlayerRef.current = new window.YT.Player("yt-player-div", {
        height: "1",
        width: "1",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ytReadyRef.current = true;
          },
          onStateChange: (event) => {
            const { YT } = window;
            if (!YT) return;

            if (event.data === YT.PlayerState.PLAYING) {
              startYTProgressPolling();
            } else if (event.data === YT.PlayerState.PAUSED) {
              stopProgressPolling();
            } else if (event.data === YT.PlayerState.ENDED) {
              stopProgressPolling();
              nextSong();
            }
          },
        },
      });
    }

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
          ytReadyRef.current = false;
        } catch {
          // ignore
        }
      }
      stopProgressPolling();
    };
  }, [nextSong, startYTProgressPolling, stopProgressPolling]);

  // Handle YouTube song changes
  useEffect(() => {
    if (!videoId || !ytReadyRef.current) return;

    const player = ytPlayerRef.current;
    if (!player) return;

    player.loadVideoById(videoId, 0);
    player.setVolume(Math.round(volume * 100));
  }, [videoId]); // intentionally not including volume here

  // Handle YouTube play/pause
  useEffect(() => {
    if (!isYouTube || !ytReadyRef.current) return;
    const player = ytPlayerRef.current;
    if (!player) return;

    // Small delay to let the video load
    setTimeout(() => {
      if (isPlaying) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    }, 100);
  }, [isPlaying, isYouTube]);

  // Handle YouTube volume
  useEffect(() => {
    if (!isYouTube || !ytReadyRef.current) return;
    const player = ytPlayerRef.current;
    if (!player) return;
    player.setVolume(Math.round(volume * 100));
  }, [volume, isYouTube]);

  // ---- HTML Audio for local songs ----
  useEffect(() => {
    if (isYouTube) return; // skip for YouTube songs

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }

    const audio = audioRef.current;

    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      nextSong();
    };

    const onTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime);
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [isYouTube, setDuration, setProgress, nextSong]);

  // Handle local song change
  useEffect(() => {
    if (isYouTube) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
      audio.src = currentSong.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {
          // Autoplay may be blocked
        });
      }
    }
  }, [currentSong?.id, isYouTube]);

  // Handle local play/pause
  useEffect(() => {
    if (isYouTube) return;

    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
  }, [isPlaying, isYouTube, currentSong]);

  // Handle local volume
  useEffect(() => {
    if (isYouTube) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume, isYouTube]);

  // Seek function - works for both local and YouTube
  const seekTo = useCallback(
    (time: number) => {
      if (isYouTube && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(time, true);
        setProgress(time);
      } else if (audioRef.current) {
        audioRef.current.currentTime = time;
        setProgress(time);
      }
    },
    [isYouTube, setProgress]
  );

  // Expose seekTo on window for the progress bar
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__teoSeek = seekTo;
    return () => {
      delete (window as unknown as Record<string, unknown>).__teoSeek;
    };
  }, [seekTo]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      stopProgressPolling();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        id="yt-player-container"
        style={{
          position: "fixed",
          bottom: "90px",
          left: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      {children}
    </>
  );
}

// Utility function to get the seek function
export function getAudioSeekTo(): ((time: number) => void) | null {
  return (window as unknown as Record<string, unknown>).__teoSeek as ((time: number) => void) | null;
}
