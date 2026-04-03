'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white p-8">
      <div className="text-6xl mb-6">🎵</div>
      <h2 className="text-2xl font-bold mb-2">Page not found</h2>
      <p className="text-[#B3B3B3] text-center mb-6">
        This page doesn&apos;t exist. Let&apos;s get you back to the music.
      </p>
      <Link
        href="/"
        className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-8 py-2 rounded-lg transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
