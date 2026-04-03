export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#1DB954] animate-spin" />
        <p className="text-[#B3B3B3] text-sm">Loading Teo...</p>
      </div>
    </div>
  );
}
