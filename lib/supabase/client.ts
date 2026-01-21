import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Try different possible env var names
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not set");
    throw new Error("Supabase configuration is missing");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
