import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="auth-error-page">
      <h1>Sign-in failed</h1>
      <p>Something went wrong with Google sign-in. Please try again.</p>
      <Link href="/" className="btn btn-primary">Back to home</Link>
    </main>
  )
}
