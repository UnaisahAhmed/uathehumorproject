import { createClient } from '@/utils/supabase/server'
import CaptionViewer from '@/components/caption-viewer'
import LoginButton from '@/components/auth/login-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="login-root">
        <div className="login-box">
          <div className="login-emoji">😂</div>
          <h1 className="login-title">Humor Project</h1>
          <p className="login-sub">
            Help decode what makes things funny. Rate captions, one at a time.
          </p>
          <LoginButton />
        </div>
      </main>
    )
  }

  const { data: captions, error } = await supabase
    .from('captions')
    .select(`
      id,
      content,
      profile_id,
      created_datetime_utc,
      caption_votes (
        profile_id,
        vote_value
      )
    `)
    .order('created_datetime_utc', { ascending: false })
    .order('id', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching captions', error)
    return (
      <div className="container text-center">
        Error loading content. Please try again later.
      </div>
    )
  }

  const formatted = (captions ?? []).map((c: any) => {
    const userVoteObj = c.caption_votes.find(
      (v: any) => v.profile_id === user.id
    )

    const userVote = userVoteObj?.vote_value ?? 0

    // ✅ Option A: include ALL votes (including current user)
    const totalScore = c.caption_votes.reduce(
      (acc: number, v: any) => acc + v.vote_value,
      0
    )

    return {
      id: c.id,
      content: c.content,
      profile_id: c.profile_id,
      totalScore, // ✅ fixed
      userVote,
    }
  })

  return (
    <CaptionViewer
      captions={formatted}
      userEmail={user.email ?? ''}
    />
  )
}