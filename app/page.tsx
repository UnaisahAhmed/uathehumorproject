import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isSupabaseConfigured } from '@/utils/supabase/config'
import LoginButton from '@/components/auth/login-button'

export default async function Home() {
  let user = null

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const response = await supabase.auth.getUser()
    user = response.data.user
  }

  if (user) {
    redirect('/choose')
  }

  return (
    <main className="landing-mock-root">
      <header className="mock-topbar">
        <Link href="/" className="mock-brand" aria-label="Go to home">
          <span>THE </span>
          <span className="brand-accent">HUMOR</span>
          <span> PROJECT</span>
        </Link>
      </header>

      <section className="landing-stage">
        <h1 className="landing-hero-title">
          <span>THE </span>
          <span className="brand-accent">HUMOR </span>
          <span>PROJECT</span>
        </h1>

        <p className="landing-hero-sub">Investigating &amp; improving humor, one caption at a time</p>

        <div className="reaction-area" aria-hidden="true">
          <p className="reaction-bubble b1">👩🏽 &ldquo;Um... what?&rdquo; 🤨</p>
          <p className="reaction-bubble b2">🧑🏾 &ldquo;Bruh. That&apos;s not funny.&rdquo; 👎</p>
          <p className="reaction-bubble b3">👱🏻‍♀️ No way lol</p>
          <p className="reaction-bubble b4">👩🏿 &ldquo;I&apos;m dead.&rdquo; 💀💀</p>
          <p className="reaction-bubble b5">🧑🏻 &ldquo;You thought you ate.&rdquo; 🙄</p>
          <p className="reaction-bubble b6">👨🏿 &ldquo;LOL stop!&rdquo; 😭</p>

          <div className="landing-login-btn">
            <LoginButton />
          </div>
        </div>
      </section>
    </main>
  )
}
