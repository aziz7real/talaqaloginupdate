/**
 * Supabase project settings, from .env.local (never committed) or the host's
 * environment variables. The publishable key is meant to be public: the
 * database's row-level security, not the key, protects each business's data.
 * The secret service-role key never belongs in this app's request path.
 *
 * Until both are set, the site runs exactly as before: the dashboard shows the
 * sample business and the login page says sign-in isn't live.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = supabaseUrl !== "" && supabaseKey !== "";
