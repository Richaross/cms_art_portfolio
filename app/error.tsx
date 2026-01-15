'use client';

import { useEffect } from 'react';
import { SentryLogger } from '@/lib/logging/SentryLogger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    const logger = new SentryLogger();
    logger.error('Unhandled UI Error', error, { digest: error.digest });

    // Also log to console for development
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-center flex-col p-8 text-center justify-center">
      <h2 className="text-3xl font-bold mb-4 tracking-tighter">Something went wrong</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        We&apos;ve encountered an unexpected error. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
