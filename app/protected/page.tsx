import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/') // Redirect to home if not logged in
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Protected Content</h1>
      <p>Welcome, {user.email}!</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        You are seeing this because you are authenticated.
      </div>
    </div>
  )
}