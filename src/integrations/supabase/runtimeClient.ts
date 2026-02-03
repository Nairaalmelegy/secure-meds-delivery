import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Runtime-safe client.
 *
 * In some preview/build environments `import.meta.env.VITE_SUPABASE_URL` may be undefined,
 * which hard-crashes the app at module evaluation time in the auto-generated client.
 *
 * We keep a fallback to ensure the app renders and can recover.
 */
const FALLBACK_SUPABASE_URL = "https://gottcxzyigbcluccvaqk.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdHRjeHp5aWdiY2x1Y2N2YXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzY5NjIsImV4cCI6MjA3OTA1Mjk2Mn0.Q_bdGtvogk_2VFQj3ABWXBxL41c5r9vnFVbfTqzVeds";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  FALLBACK_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
