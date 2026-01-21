import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Try different possible env var names
  const supabaseUrl =
    process.env.NEXT_PUBLIC_PraxisSUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_PraxisSUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not set");
    throw new Error("Supabase configuration is missing");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
