import Link from 'next/link'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/auth/signout-button'
import { createClient } from '@/utils/supabase/server'
import UploadCaptionForm from '@/components/upload-caption-form'

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/')
  }

  return (
    <div className="create-root">
      <header className="mock-topbar">
        <p className="mock-brand"><span>THE </span><span className="brand-accent">HUMOR</span><span> PROJECT</span></p>
        <nav className="mock-nav" aria-label="App sections">
          <Link href="/rate">RATE</Link>
          <Link href="/upload" aria-current="page">CREATE</Link>
          <Link href="/choose">HOME</Link>
          <SignOutButton />
        </nav>
      </header>

      <main className="create-main">
        <h1 className="page-label">create page</h1>

        <section className="create-layout-mock">
          <div className="create-title-block">CREATE</div>

          <ol className="create-steps-mock">
            <li><span>1</span> STEP 1 upload</li>
            <li><span>2</span> STEP 2</li>
            <li><span>3</span> STEP 3</li>
            <li><span>4</span> STEP 4</li>
          </ol>
        </section>

        <section className="upload-form-panel">
          <UploadCaptionForm />
        </section>

        <div className="create-footer-meta">
          <span>Confidential</span>
          <span>{user.email?.split('@')[0]}</span>
        </div>
      </main>
    </div>
  )
}
