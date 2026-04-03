import { create } from "zustand";

export interface Song {
  id: string;
  title: string;
  duration: number;
  cover: string;
  audioUrl: string;
  artistId: string;
  artist: { id: string; name: string; image: string } | { id: string; name: string; image: string; bio: string };
  albumId: string | null;
  album: { id: string; title: string; cover: string } | { id: string; title: string; cover: string; year: number; artistId: string } | null;
  /** Track source: "local" for DB songs, "youtube"/"itunes"/"deezer" for external */
  source?: "local" | "youtube" | "itunes" | "deezer";
}

export interface YouTubeTrack {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  shuffle: boolean;
  repeatMode: "off" | "all" | "one";
  playSong: (song: Song, queue?: Song[]) => void;
  playYouTubeTrack: (track: YouTubeTrack, queue?: YouTubeTrack[]) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
}

function youTubeTrackToSong(track: YouTubeTrack): Song {
  return {
    id: `yt-${track.videoId}`,
    title: track.title,
    duration: 0,
    cover: track.thumbnail,
    audioUrl: track.videoId,
    artistId: `yt-ch-${track.channel}`,
    artist: { id: `yt-ch-${track.channel}`, name: track.channel, image: "" },
    albumId: null,
    album: null,
    source: "youtube",
  };
}

export { youTubeTrackToSong };

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  queue: [],
  queueIndex: -1,
  shuffle: false,
  repeatMode: "off",

  playSong: (song, queue) => {
    const state = get();
    if (queue) {
      const index = queue.findIndex((s) => s.id === song.id);
      set({
        currentSong: song,
        isPlaying: true,
        queue,
        queueIndex: index >= 0 ? index : 0,
        progress: 0,
        duration: 0,
      });
    } else {
      set({
        currentSong: song,
        isPlaying: true,
        queue: [song],
        queueIndex: 0,
        progress: 0,
        duration: 0,
      });
    }
  },

  playYouTubeTrack: (track, queue) => {
    const song = youTubeTrackToSong(track);
    const songs = queue ? queue.map(youTubeTrackToSong) : [song];
    const state = get();
    const index = songs.findIndex((s) => s.id === song.id);
    set({
      currentSong: song,
      isPlaying: true,
      queue: songs,
      queueIndex: index >= 0 ? index : 0,
      progress: 0,
      duration: 0,
    });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (vol) => {
    set({ volume: Math.max(0, Math.min(1, vol)) });
  },

  setProgress: (p) => {
    set({ progress: p });
  },

  setDuration: (d) => {
    set({ duration: d });
  },

  nextSong: () => {
    const state = get();
    if (state.queue.length === 0) return;

    if (state.repeatMode === "one") {
      set({ progress: 0, isPlaying: true });
      return;
    }

    let nextIndex = state.queueIndex + 1;
    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === "all") {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    set({
      currentSong: state.queue[nextIndex],
      queueIndex: nextIndex,
      progress: 0,
      duration: 0,
      isPlaying: true,
    });
  },

  prevSong: () => {
    const state = get();
    if (state.queue.length === 0) return;

    if (state.progress > 3) {
      set({ progress: 0 });
      return;
    }

    let prevIndex = state.queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.repeatMode === "all" ? state.queue.length - 1 : 0;
    }

    set({
      currentSong: state.queue[prevIndex],
      queueIndex: prevIndex,
      progress: 0,
      duration: 0,
      isPlaying: true,
    });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"];
      const currentIndex = modes.indexOf(state.repeatMode);
      return { repeatMode: modes[(currentIndex + 1) % modes.length] };
    });
  },

  addToQueue: (song) => {
    set((state) => ({
      queue: [...state.queue, song],
    }));
  },
}));
