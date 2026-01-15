'use client';

import { SentryLogger } from '@/lib/logging/SentryLogger';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log fatal error to Sentry
    const logger = new SentryLogger();
    logger.error('Fatal Application Error', error, { digest: error.digest });

    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 tracking-tighter">Fatal Error</h1>
          <p className="text-gray-400 mb-8">
            A critical error has occurred. We have been notified and are looking into it.
          </p>
          <button
            onClick={() => reset()}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
