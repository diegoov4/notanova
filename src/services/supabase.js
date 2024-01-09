import { createClient } from '@supabase/supabase-js';

// credenciales de Supabase
const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY;

// Crea y exporta una instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);