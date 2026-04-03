'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white p-8">
      <div className="text-6xl mb-6">🎵</div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-[#B3B3B3] text-center mb-6 max-w-md">
        {error.message || "Teo encountered an unexpected error. Don't worry, your music is safe."}
      </p>
      <Button
        onClick={() => reset()}
        className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-8"
      >
        Try again
      </Button>
    </div>
  );
}
