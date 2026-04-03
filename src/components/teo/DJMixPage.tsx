"use client";

import { useState, useMemo } from "react";
import { useDJStore, type DJDeck } from "@/store/dj-store";
import { usePlayerStore } from "@/store/player-store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  SkipForward,
  Disc3,
  Zap,
  Waves,
  Music,
  Loader2,
  Volume2,
  Crosshair,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────
const MOODS = ["Energetic", "Chill", "Dark", "Uplifting", "Melancholic"] as const;
const GENRES = ["Pop", "Electronic", "Hip-Hop", "Rock", "Jazz", "R&B", "Latin", "Reggaeton"] as const;
const DURATIONS = ["15 min", "30 min", "60 min", "90 min"] as const;

// ─── Waveform Component ──────────────────────────────────────────
function WaveformVisualizer({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        delay: (i * 0.05).toFixed(2),
        baseHeight: 20 + Math.random() * 60,
      })),
    []
  );

  return (
    <div className="flex items-end justify-center gap-[2px] h-16 w-full px-2">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="waveform-bar rounded-t-sm flex-1 min-w-[2px] transition-colors duration-200"
          style={{
            height: `${bar.baseHeight}%`,
            backgroundColor: isPlaying ? color : "#404040",
            animationPlayState: isPlaying ? "running" : "paused",
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── EQ Knob Component ───────────────────────────────────────────
function EQKnob({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  const rotation = (value / 100) * 270 - 135;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <div
            className="w-8 h-8 rounded-full border-2 border-white/20 bg-[#282828] flex items-center justify-center relative transition-all duration-200 group-hover:border-[#1DB954]/60 group-hover:shadow-[0_0_10px_rgba(29,185,84,0.2)]"
            onClick={() => onChange(value < 50 ? value + 10 : value - 10)}
          >
            <div
              className="absolute w-[2px] h-3 bg-[#1DB954] rounded-full origin-bottom"
              style={{
                transform: `rotate(${rotation}deg)`,
                bottom: "50%",
              }}
            />
          </div>
          <span className="text-[10px] text-[#B3B3B3] font-medium uppercase tracking-wider">
            {label}
          </span>
          <span className="text-[9px] text-[#777]">{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-[#282828] text-white border-white/10 text-xs">
        {label}: {value}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Effect Knob Component ───────────────────────────────────────
function EffectKnob({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (val: number) => void;
}) {
  const rotation = (value / 100) * 270 - 135;
  const isActive = value > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 hover:bg-white/5 group"
          onClick={() => onChange(value >= 100 ? 0 : value + 10)}
        >
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative transition-all duration-300 ${
              isActive
                ? "border-[#1DB954] bg-[#1DB954]/10 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                : "border-white/20 bg-[#282828]"
            }`}
          >
            <div
              className={`absolute w-[2px] h-4 rounded-full origin-bottom transition-colors duration-300 ${
                isActive ? "bg-[#1DB954]" : "bg-white/40"
              }`}
              style={{
                transform: `rotate(${rotation}deg)`,
                bottom: "50%",
              }}
            />
            {isActive && (
              <div className="absolute inset-0 rounded-full animate-pulse bg-[#1DB954]/5" />
            )}
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold text-white block">{label}</span>
            {sublabel && (
              <span className="text-[9px] text-[#777]">{sublabel}</span>
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-[#282828] text-white border-white/10 text-xs">
        {label}: {value}%
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Deck Component ──────────────────────────────────────────────
function DeckPanel({
  label,
  deck,
  accentColor,
  onTogglePlay,
  onVolumeChange,
  onEQChange,
  onPlayInMain,
}: {
  label: string;
  deck: DJDeck;
  accentColor: string;
  onTogglePlay: () => void;
  onVolumeChange: (vol: number) => void;
  onEQChange: (band: keyof DJDeck["eq"], val: number) => void;
  onPlayInMain: () => void;
}) {
  const hasTrack = !!deck.track;

  return (
    <div className="flex-1 min-w-0 bg-[#181818] rounded-2xl border border-white/[0.06] p-5 flex flex-col gap-4 transition-all duration-300">
      {/* Deck Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3
            className={`w-4 h-4 transition-colors duration-300 ${
              deck.isPlaying ? "animate-spin" : ""
            }`}
            style={{ color: accentColor }}
          />
          <span className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            {label}
          </span>
        </div>
        {deck.bpm > 0 && (
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-white/10 text-[#B3B3B3]"
          >
            {deck.bpm} BPM
          </Badge>
        )}
      </div>

      {/* Track Info */}
      {hasTrack ? (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#282828] shadow-lg">
            {deck.track.thumbnail ? (
              <img
                src={deck.track.thumbnail}
                alt={deck.track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-[#555]" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{deck.track.title}</p>
            <p className="text-xs text-[#B3B3B3] truncate mt-0.5">{deck.track.channel}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-14 rounded-lg bg-[#282828]/50 border border-dashed border-white/10">
          <span className="text-xs text-[#555]">No track loaded</span>
        </div>
      )}

      {/* Waveform */}
      <div className="bg-[#111] rounded-xl p-2 border border-white/[0.04]">
        <WaveformVisualizer isPlaying={deck.isPlaying} color={accentColor} />
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className={`rounded-full h-10 w-10 transition-all duration-200 ${
            deck.isPlaying
              ? "bg-white/10 hover:bg-white/20"
              : "hover:bg-white/10"
          }`}
          onClick={onTogglePlay}
          disabled={!hasTrack}
        >
          {deck.isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-[#B3B3B3] hover:text-white hover:bg-white/10 h-8 gap-1.5"
          onClick={onPlayInMain}
          disabled={!hasTrack}
        >
          <SkipForward className="w-3.5 h-3.5" />
          Play
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-[#B3B3B3]" />
          <Slider
            value={[Math.round(deck.volume * 100)]}
            onValueChange={(v) => onVolumeChange(v[0] / 100)}
            min={0}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      </div>

      {/* EQ Section */}
      <div className="bg-[#111]/50 rounded-xl p-3 border border-white/[0.04]">
        <p className="text-[10px] text-[#666] font-semibold uppercase tracking-[0.15em] mb-3">
          Equalizer
        </p>
        <div className="flex items-center justify-around">
          <EQKnob label="Low" value={deck.eq.low} onChange={(v) => onEQChange("low", v)} />
          <EQKnob label="Mid" value={deck.eq.mid} onChange={(v) => onEQChange("mid", v)} />
          <EQKnob label="High" value={deck.eq.high} onChange={(v) => onEQChange("high", v)} />
        </div>
      </div>
    </div>
  );
}

// ─── Mix Timeline Component ──────────────────────────────────────
function MixTimeline({
  tracks,
  deckATrackId,
  deckBTrackId,
}: {
  tracks: { id: string; title: string }[];
  deckATrackId: string | null;
  deckBTrackId: string | null;
}) {
  if (tracks.length === 0) return null;

  return (
    <div className="bg-[#181818] rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Waves className="w-4 h-4 text-[#1DB954]" />
        <h3 className="text-sm font-bold text-white">Mix Timeline</h3>
        <Badge variant="outline" className="text-[10px] border-white/10 text-[#B3B3B3] ml-auto">
          {tracks.length} tracks
        </Badge>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch gap-1 min-w-max">
          {tracks.map((track, idx) => {
            const isDeckA = track.id === deckATrackId;
            const isDeckB = track.id === deckBTrackId;
            const isActive = isDeckA || isDeckB;

            return (
              <div key={track.id} className="flex items-center">
                <div
                  className={`relative flex flex-col justify-between rounded-lg px-3 py-2 min-w-[120px] max-w-[160px] h-16 transition-all duration-300 cursor-pointer hover:brightness-110 ${
                    isDeckA
                      ? "bg-[#1DB954]/20 border border-[#1DB954]/40 shadow-[0_0_12px_rgba(29,185,84,0.15)]"
                      : isDeckB
                      ? "bg-purple-500/20 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                      : "bg-[#282828] border border-white/[0.06]"
                  }`}
                >
                  <span className="text-[10px] text-[#777] font-mono">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[11px] text-white truncate leading-tight">
                    {track.title}
                  </p>
                  {isActive && (
                    <div
                      className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                        isDeckA ? "bg-[#1DB954]" : "bg-purple-500"
                      } animate-pulse`}
                    />
                  )}
                </div>
                {idx < tracks.length - 1 && (
                  <div className="flex items-center px-1">
                    <div className="w-3 h-[1px] bg-white/20" />
                    <Crosshair className="w-2 h-2 text-[#555] -mx-0.5" />
                    <div className="w-3 h-[1px] bg-white/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main DJMixPage Component ────────────────────────────────────
export function DJMixPage() {
  const [selectedMood, setSelectedMood] = useState<string>("Energetic");
  const [selectedGenre, setSelectedGenre] = useState<string>("Electronic");
  const [selectedDuration, setSelectedDuration] = useState<string>("30 min");

  const {
    deckA,
    deckB,
    crossfade,
    effects,
    isGenerating,
    currentMix,
    setDeckATrack,
    setDeckBTrack,
    toggleDeckA,
    toggleDeckB,
    setDeckAVolume,
    setDeckBVolume,
    setCrossfade,
    setEffect,
    setDeckAEQ,
    setDeckBEQ,
    generateMix,
  } = useDJStore();

  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack);

  const handleGenerate = async () => {
    await generateMix(selectedMood, selectedGenre);
  };

  const handlePlayDeckInMain = (deck: DJDeck) => {
    if (!deck.track) return;
    playYouTubeTrack(deck.track);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ─── Section 1: Mix Generator ─────────────────────────── */}
      <div className="bg-[#181818] rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-5 h-5 text-[#1DB954]" />
          <h2 className="text-lg font-bold text-white">AI Mix Generator</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Mood Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#B3B3B3] font-semibold uppercase tracking-wider">
              Mood
            </label>
            <Select value={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger className="w-[150px] bg-[#282828] border-white/10 text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-white/10 text-white">
                {MOODS.map((mood) => (
                  <SelectItem key={mood} value={mood} className="text-white focus:bg-white/10 focus:text-white">
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genre Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#B3B3B3] font-semibold uppercase tracking-wider">
              Genre
            </label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[150px] bg-[#282828] border-white/10 text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#282828] border-white/10 text-white">
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre} className="text-white focus:bg-white/10 focus:text-white">
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Preset Buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#B3B3B3] font-semibold uppercase tracking-wider">
              Duration
            </label>
            <div className="flex gap-1">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    selectedDuration === dur
                      ? "bg-[#1DB954] text-black shadow-[0_0_12px_rgba(29,185,84,0.3)]"
                      : "bg-[#282828] text-[#B3B3B3] border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="ml-auto">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold h-9 px-6 gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Mix
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Two Decks ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DeckPanel
          label="Deck A"
          deck={deckA}
          accentColor="#1DB954"
          onTogglePlay={toggleDeckA}
          onVolumeChange={setDeckAVolume}
          onEQChange={setDeckAEQ}
          onPlayInMain={() => handlePlayDeckInMain(deckA)}
        />
        <DeckPanel
          label="Deck B"
          deck={deckB}
          accentColor="#a855f7"
          onTogglePlay={toggleDeckB}
          onVolumeChange={setDeckBVolume}
          onEQChange={setDeckBEQ}
          onPlayInMain={() => handlePlayDeckInMain(deckB)}
        />
      </div>

      {/* ─── Section 3: Crossfader + Effects ──────────────────── */}
      <div className="bg-[#181818] rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-5">
          <Crosshair className="w-4 h-4 text-[#1DB954]" />
          <h3 className="text-sm font-bold text-white">Mixer & Effects</h3>
        </div>

        <div className="flex flex-col gap-6">
          {/* Crossfader */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-[#1DB954] w-4 text-center">A</span>
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <span className="text-[9px] text-[#555]">DECK A</span>
                <span className="text-[9px] text-[#555]">DECK B</span>
              </div>
              <Slider
                value={[crossfade]}
                onValueChange={(v) => setCrossfade(v[0])}
                min={0}
                max={100}
                step={1}
                className="h-2 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white/30 [&_[data-slot=slider-thumb]]:shadow-[0_0_10px_rgba(29,185,84,0.3)]"
              />
            </div>
            <span className="text-xs font-bold text-purple-500 w-4 text-center">B</span>
          </div>

          {/* Effects */}
          <div className="border-t border-white/[0.06] pt-5">
            <div className="flex items-center justify-center gap-8">
              <EffectKnob
                label="Reverb"
                value={effects.reverb}
                onChange={(v) => setEffect("reverb", v)}
              />
              <EffectKnob
                label="Echo"
                value={effects.echo}
                onChange={(v) => setEffect("echo", v)}
              />
              <EffectKnob
                label="Filter"
                sublabel="LP ○ HP"
                value={effects.filter}
                onChange={(v) => setEffect("filter", v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 4: Mix Timeline ─────────────────────────── */}
      {currentMix && (
        <MixTimeline
          tracks={currentMix.tracks}
          deckATrackId={deckA.track?.id ?? null}
          deckBTrackId={deckB.track?.id ?? null}
        />
      )}
    </div>
  );
}
