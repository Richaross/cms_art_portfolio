import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_API_SECRET: z.string().min(1),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url()
    .refine((val) => val !== 'https://your_dsn_here.com', 'Sentry DSN is still a placeholder')
    .optional()
    .or(z.literal('your_dsn_here')),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(), // Some environments might not need this if already logged in via CLI

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
