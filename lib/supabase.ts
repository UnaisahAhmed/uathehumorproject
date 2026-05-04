import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/utils/supabase/config'

const config = getSupabaseConfig()

if (!config) {
  throw new Error('Supabase environment variables are not configured.')
}

export const supabase = createClient(config.url, config.anonKey)
