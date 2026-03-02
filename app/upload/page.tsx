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
        <Link href="/choose" className="mock-brand" aria-label="Go to home">
          <span>THE </span>
          <span className="brand-accent">HUMOR</span>
          <span> PROJECT</span>
        </Link>

        <nav className="mock-nav" aria-label="App sections">
          <Link href="/rate">Rate</Link>
          <Link href="/upload" aria-current="page">Create</Link>
          <span className="user-chip">{user.email?.split('@')[0]}</span>
          <SignOutButton />
        </nav>
      </header>

      <main className="create-main compact-main">
        <section className="create-layout-mock compact-layout">
          <div className="create-title-block">Create</div>

          <ol className="create-steps-mock">
            <li><span>1</span>Pick an image file (JPG, PNG, WEBP, GIF, or HEIC).</li>
            <li><span>2</span>We upload it securely to cloud storage.</li>
            <li><span>3</span>We register the image in the caption pipeline.</li>
            <li><span>4</span>You get generated captions instantly below.</li>
          </ol>
        </section>

        <section className="upload-form-panel compact-panel">
          <UploadCaptionForm />
        </section>
      </main>
    </div>
  )
}
