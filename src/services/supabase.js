import { createClient } from '@supabase/supabase-js'

// credenciales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Crea y exporta una instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
