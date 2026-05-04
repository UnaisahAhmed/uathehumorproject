import Link from 'next/link'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/auth/signout-button'
import { createClient } from '@/utils/supabase/server'
import { isSupabaseConfigured } from '@/utils/supabase/config'

export default async function ChoosePage() {
  if (!isSupabaseConfigured()) {
    return redirect('/')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/')
  }

  return (
    <main className="choose-mock-root">
      <header className="mock-topbar">
        <Link href="/choose" className="mock-brand" aria-label="Go to home">
          <span>THE </span>
          <span className="brand-accent">HUMOR</span>
          <span> PROJECT</span>
        </Link>

        <nav className="mock-nav" aria-label="App sections">
          <Link href="/rate">Rate</Link>
          <Link href="/upload">Create</Link>
          <span className="user-chip">{user.email?.split('@')[0]}</span>
          <SignOutButton />
        </nav>
      </header>

      <section className="choose-split-wrap">
        <Link href="/rate" className="split-choice split-choice-rate">
          <h2>Rate Captions</h2>
          <p>See a meme, react fast, teach the model what lands.</p>
        </Link>

        <Link href="/upload" className="split-choice split-choice-create">
          <h2>Create Captions</h2>
          <p>Upload an image and generate caption options in seconds.</p>
        </Link>
      </section>
    </main>
  )
}
