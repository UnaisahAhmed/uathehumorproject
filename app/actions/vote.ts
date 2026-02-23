'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to vote.' }
  }

  // If vote is 0 (toggled off), delete the row
  if (voteValue === 0) {
    const { error } = await supabase
      .from('caption_votes')
      .delete()
      .eq('caption_id', captionId)
      .eq('profile_id', user.id)

    if (error) {
      console.error('Error removing vote:', error)
      return { error: 'Failed to remove vote' }
    }

   revalidatePath('/')
    return { success: true }
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('caption_votes')
    .upsert(
      {
        caption_id: captionId,
        profile_id: user.id,
        vote_value: voteValue,
        created_datetime_utc: now,
        modified_datetime_utc: now,
      },
      { onConflict: 'profile_id,caption_id' }
    )

  if (error) {
    console.error('Error submitting vote:', error)
    return { error: 'Failed to submit vote' }
  }

   revalidatePath('/')
  return { success: true }
}