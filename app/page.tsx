import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LoginButton from '@/components/auth/login-button'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/choose')
  }

  return (
    <main className="landing-mock-root">
      <header className="mock-topbar">
        <p className="mock-brand">
          <span>THE </span>
          <span className="brand-accent">HUMOR</span>
          <span> PROJECT</span>
        </p>
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
          <p className="reaction-bubble b3">👱🏻‍♀️ NO WAY LOLL</p>
          <p className="reaction-bubble b4">👩🏿 &ldquo;I&apos;M DED.&rdquo; 💀💀</p>
          <p className="reaction-bubble b5">🧑🏻 &ldquo;You thought you ate.&rdquo; 🙄</p>
          <p className="reaction-bubble b6">👨🏿 &ldquo;LOL STOP!&rdquo; 😭</p>

          <div className="landing-login-btn">
            <LoginButton />
          </div>
        </div>
      </section>
    </main>
  )
}