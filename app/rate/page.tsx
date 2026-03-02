import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CaptionViewer from '@/components/caption-viewer'

interface CaptionVoteRow {
  caption_id: string
  profile_id: string
  vote_value: number
}

interface CaptionRow {
  id: string
  content: string | null
  profile_id: string
  image:
    | {
        url: string | null
      }
    | Array<{
        url: string | null
      }>
    | null
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/')
  }

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
    .order('id', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching captions', error)
    return (
      <div className="container text-center">
        Error loading content. Please try again later.
      </div>
    )
  }

  const captionsWithImage = ((captions ?? []) as CaptionRow[]).filter(
    (c) => getImageUrl(c.image).trim().length > 0 && typeof c.content === 'string' && c.content.trim().length > 0
  )

  if (captionsWithImage.length === 0) {
    return <CaptionViewer captions={[]} userEmail={user.email ?? ''} />
  }

  const captionIds = captionsWithImage.map((c) => c.id)

  const { data: votes, error: votesError } = await supabase
    .from('caption_votes')
    .select('caption_id, profile_id, vote_value')
    .in('caption_id', captionIds)

  if (votesError) {
    console.error('Error fetching caption votes', votesError)
    return (
      <div className="container text-center">
        Error loading votes. Please try again later.
      </div>
    )
  }

  const voteMap = new Map<string, { totalScore: number; userVote: number }>()
  for (const id of captionIds) {
    voteMap.set(id, { totalScore: 0, userVote: 0 })
  }

  for (const vote of (votes ?? []) as CaptionVoteRow[]) {
    const existing = voteMap.get(vote.caption_id)
    if (!existing) {
      continue
    }
    existing.totalScore += vote.vote_value
    if (vote.profile_id === user.id) {
      existing.userVote = vote.vote_value
    }
  }

  const formatted = captionsWithImage.map((c) => {
    const score = voteMap.get(c.id) ?? { totalScore: 0, userVote: 0 }

    return {
      id: c.id,
      content: c.content ?? '',
      profile_id: c.profile_id,
      imageUrl: getImageUrl(c.image),
      totalScore: score.totalScore,
      userVote: score.userVote,
    }
  })

  return <CaptionViewer captions={formatted} userEmail={user.email ?? ''} />
}
