'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('rating_session_')) {
          localStorage.removeItem(key)
        }
      }
    } catch {
      // Ignore storage errors during sign out.
    }

    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      className="signout-btn"
    >
      Sign Out
    </button>
  )
}
