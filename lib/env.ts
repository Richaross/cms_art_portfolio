import { z } from 'zod';

const isCI = process.env.CI === 'true';

const emptyStringToUndefined = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional()
);

/**
 * Helper to provide a default value ONLY during CI.
 * This ensures the Zod schema passes validation even with empty/missing secrets.
 */
const withCiFallback = (schema: z.ZodString | z.ZodOptional<z.ZodString>, fallback: string) => {
  return z.preprocess((val) => {
    if (isCI && (val === undefined || val === '' || val === null)) {
      return fallback;
    }
    return val;
  }, schema);
};

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: withCiFallback(z.string().url(), 'https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: withCiFallback(z.string().min(1), 'placeholder-key'),

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: withCiFallback(z.string().min(1), 'placeholder'),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: withCiFallback(z.string().min(1), 'placeholder'),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: withCiFallback(z.string().min(1), 'placeholder'),
  NEXT_PUBLIC_CLOUDINARY_API_SECRET: withCiFallback(z.string().min(1), 'placeholder'),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(
    (val) => {
      if (isCI && (val === undefined || val === '' || val === null)) {
        return 'your_dsn_here';
      }
      return val;
    },
    emptyStringToUndefined
      .pipe(
        z.union([
          z
            .string()
            .url()
            .refine(
              (val) => val !== 'https://your_dsn_here.com',
              'Sentry DSN is still a placeholder'
            ),
          z.literal('your_dsn_here'),
        ])
      )
      .optional()
  ),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

  // App Env
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Performance Analysis
  ANALYZE: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
