import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export the type for use in other files
export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "a397e6dc-f140-4a09-bb33-c5c3edae1bca";
