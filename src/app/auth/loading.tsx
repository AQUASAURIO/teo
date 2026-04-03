export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#1DB954] animate-spin" />
        <p className="text-[#B3B3B3] text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
