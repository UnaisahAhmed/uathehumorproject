import Link from 'next/link'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/auth/signout-button'
import { createClient } from '@/utils/supabase/server'

export default async function ChoosePage() {
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
        <p className="mock-brand"><span>THE </span><span className="brand-accent">HUMOR</span><span> PROJECT after log in page</span></p>
      </header>

      <section className="choose-stage">
        <h1>DO YOU WANT TO:</h1>

        <div className="choose-cards">
          <Link href="/rate" className="choose-card-item">
            <h2>LAUGH <span>(RATE CAPTIONS)</span></h2>
          </Link>

          <Link href="/upload" className="choose-card-item">
            <h2>MAKE OTHERS LAUGH <span>(CREATE YOUR OWN MEME)</span></h2>
          </Link>
        </div>

        <div className="choose-copy-row">
          <p>
            Help us rate captions and improve our understanding of what truly is LOL 💀💀 and what is 🙄
          </p>
          <p>
            Upload your own photos and we’ll create a couple of captions!
          </p>
        </div>

        <div className="choose-actions">
          <span className="user-chip">{user.email?.split('@')[0]}</span>
          <SignOutButton />
        </div>
      </section>
    </main>
  )
}
