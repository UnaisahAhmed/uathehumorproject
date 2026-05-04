import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseConfig } from '@/utils/supabase/config'

export function createClient() {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return createBrowserClient(
    config.url,
    config.anonKey
  )
}
