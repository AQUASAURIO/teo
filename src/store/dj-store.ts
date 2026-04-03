import { create } from "zustand";
import type { YouTubeTrack } from "./player-store";

export interface DJDeck {
  track: YouTubeTrack | null;
  isPlaying: boolean;
  volume: number;
  bpm: number;
  eq: { low: number; mid: number; high: number };
}

export interface DJEffect {
  reverb: number;
  echo: number;
  filter: number;
}

export interface DJMix {
  id: string;
  name: string;
  mood: string;
  genre: string;
  tracks: YouTubeTrack[];
  createdAt: string;
}

interface DJState {
  deckA: DJDeck;
  deckB: DJDeck;
  crossfade: number;
  effects: DJEffect;
  isAutoMixing: boolean;
  isGenerating: boolean;
  currentMix: DJMix | null;
  mixHistory: DJMix[];

  setDeckATrack: (track: YouTubeTrack | null) => void;
  setDeckBTrack: (track: YouTubeTrack | null) => void;
  toggleDeckA: () => void;
  toggleDeckB: () => void;
  setDeckAVolume: (vol: number) => void;
  setDeckBVolume: (vol: number) => void;
  setDeckABpm: (bpm: number) => void;
  setDeckBBpm: (bpm: number) => void;
  setCrossfade: (val: number) => void;
  setEffect: (effect: keyof DJEffect, val: number) => void;
  setDeckAEQ: (band: keyof DJDeck["eq"], val: number) => void;
  setDeckBEQ: (band: keyof DJDeck["eq"], val: number) => void;
  setGenerating: (val: boolean) => void;
  generateMix: (mood: string, genre: string) => Promise<void>;
}

const defaultDeck: DJDeck = {
  track: null,
  isPlaying: false,
  volume: 0.75,
  bpm: 0,
  eq: { low: 50, mid: 50, high: 50 },
};

const defaultEffects: DJEffect = {
  reverb: 0,
  echo: 0,
  filter: 50,
};

function simulateBPM(): number {
  return Math.floor(Math.random() * 50) + 90; // 90-140
}

export const useDJStore = create<DJState>((set, get) => ({
  deckA: { ...defaultDeck },
  deckB: { ...defaultDeck },
  crossfade: 50,
  effects: { ...defaultEffects },
  isAutoMixing: false,
  isGenerating: false,
  currentMix: null,
  mixHistory: [],

  setDeckATrack: (track) =>
    set((state) => ({
      deckA: {
        ...state.deckA,
        track,
        bpm: track ? simulateBPM() : 0,
        isPlaying: false,
      },
    })),

  setDeckBTrack: (track) =>
    set((state) => ({
      deckB: {
        ...state.deckB,
        track,
        bpm: track ? simulateBPM() : 0,
        isPlaying: false,
      },
    })),

  toggleDeckA: () =>
    set((state) => ({ deckA: { ...state.deckA, isPlaying: !state.deckA.isPlaying } })),

  toggleDeckB: () =>
    set((state) => ({ deckB: { ...state.deckB, isPlaying: !state.deckB.isPlaying } })),

  setDeckAVolume: (vol) =>
    set((state) => ({ deckA: { ...state.deckA, volume: Math.max(0, Math.min(1, vol)) } })),

  setDeckBVolume: (vol) =>
    set((state) => ({ deckB: { ...state.deckB, volume: Math.max(0, Math.min(1, vol)) } })),

  setDeckABpm: (bpm) =>
    set((state) => ({ deckA: { ...state.deckA, bpm: Math.max(60, Math.min(200, bpm)) } })),

  setDeckBBpm: (bpm) =>
    set((state) => ({ deckB: { ...state.deckB, bpm: Math.max(60, Math.min(200, bpm)) } })),

  setCrossfade: (val) => set({ crossfade: Math.max(0, Math.min(100, val)) }),

  setEffect: (effect, val) =>
    set((state) => ({
      effects: { ...state.effects, [effect]: Math.max(0, Math.min(100, val)) },
    })),

  setDeckAEQ: (band, val) =>
    set((state) => ({
      deckA: {
        ...state.deckA,
        eq: { ...state.deckA.eq, [band]: Math.max(0, Math.min(100, val)) },
      },
    })),

  setDeckBEQ: (band, val) =>
    set((state) => ({
      deckB: {
        ...state.deckB,
        eq: { ...state.deckB.eq, [band]: Math.max(0, Math.min(100, val)) },
      },
    })),

  setGenerating: (val) => set({ isGenerating: val }),

  generateMix: async (mood, genre) => {
    const { setGenerating, setDeckATrack, setDeckBTrack, toggleDeckA } = get();
    setGenerating(true);

    try {
      const query = `${genre} ${mood} DJ mix music`;
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(query)}&max=20`);
      const data = await res.json();
      const tracks: YouTubeTrack[] = (data.items || []).map(
        (item: { videoId: string; title: string; channel: string; thumbnail: string; publishedAt: string }, idx: number) => ({
          id: `dj-${idx}-${item.videoId}`,
          videoId: item.videoId,
          title: item.title,
          channel: item.channel,
          thumbnail: item.thumbnail,
          publishedAt: item.publishedAt,
        })
      );

      // Sort by simulated BPM
      tracks.forEach((t) => {
        (t as YouTubeTrack & { _bpm?: number })._bpm = simulateBPM();
      });
      tracks.sort(
        (a, b) =>
          ((a as YouTubeTrack & { _bpm?: number })._bpm || 120) -
          ((b as YouTubeTrack & { _bpm?: number })._bpm || 120)
      );

      if (tracks.length >= 2) {
        setDeckATrack(tracks[0]);
        setDeckBTrack(tracks[1]);

        // Small delay then auto-play deck A
        setTimeout(() => {
          toggleDeckA();
        }, 300);
      } else if (tracks.length === 1) {
        setDeckATrack(tracks[0]);
        setTimeout(() => {
          toggleDeckA();
        }, 300);
      }

      const mix: DJMix = {
        id: `mix-${Date.now()}`,
        name: `${genre} ${mood} Mix`,
        mood,
        genre,
        tracks,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        currentMix: mix,
        mixHistory: [mix, ...state.mixHistory].slice(0, 20),
        isAutoMixing: true,
      }));
    } catch (error) {
      console.error("Failed to generate mix:", error);
    } finally {
      setGenerating(false);
    }
  },
}));
