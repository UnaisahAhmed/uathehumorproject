import { createClient } from '@/utils/supabase/server'
import { isSupabaseConfigured } from '@/utils/supabase/config'
import { redirect } from 'next/navigation'
import CaptionViewer from '@/components/caption-viewer'

export const dynamic = 'force-dynamic'

interface CaptionVoteRow {
  caption_id: string
  vote_value: number
}

interface CaptionRow {
  id: string
  content: string | null
  profile_id: string
  image: { url: string | null } | Array<{ url: string | null }> | null
}

function getImageUrl(image: CaptionRow['image']): string {
  if (Array.isArray(image)) {
    const url = image[0]?.url
    return typeof url === 'string' ? url : ''
  }
  const url = image?.url
  return typeof url === 'string' ? url : ''
}

export default async function RatePage() {
  if (!isSupabaseConfigured()) {
    return redirect('/')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirect('/')

  // All captions this user has voted on (needed to compute vote status for session captions)
  const { data: userVotes, error: votesError } = await supabase
    .from('caption_votes')
    .select('caption_id, vote_value')
    .eq('profile_id', user.id)

  if (votesError) {
    console.error('Error fetching user votes', votesError)
    return (
      <div className="container text-center">
        Error loading your vote history. Please try again later.
      </div>
    )
  }

  const voteMap = new Map(
    (userVotes ?? []).map((v: CaptionVoteRow) => [v.caption_id, v.vote_value])
  )

  // All public captions from other users — client picks the session of 25
  const { data: captions, error } = await supabase
    .from('captions')
    .select(
      `
      id,
      content,
      profile_id,
      image:images!inner (
        url
      )
    `
    )
    .eq('is_public', true)
    .eq('images.is_public', true)
    .neq('profile_id', user.id)
    .limit(500)

  if (error) {
    console.error('Error fetching captions', error)
    return (
      <div className="container text-center">
        Error loading content. Please try again later.
      </div>
    )
  }

  const formatted = ((captions ?? []) as CaptionRow[])
    .filter(
      (c) =>
        getImageUrl(c.image).trim().length > 0 &&
        typeof c.content === 'string' &&
        c.content.trim().length > 0
    )
    .map((c) => ({
      id: c.id,
      content: c.content ?? '',
      profile_id: c.profile_id,
      imageUrl: getImageUrl(c.image),
      userVote: voteMap.get(c.id) ?? 0,
      totalScore: 0,
    }))

  return (
    <CaptionViewer
      captions={formatted}
      userEmail={user.email ?? ''}
      userId={user.id}
    />
  )
}
