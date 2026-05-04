'use client'

import { useCallback, useEffect, useState } from 'react'
import { submitVote } from '@/app/actions/vote'

export default function VoteButtons({
  captionId,
  initialUserVote = 0,
  onVoteOptimistic,
  onVoteSuccess
}: {
  captionId: string
  initialUserVote?: number
  onVoteOptimistic?: (result: { direction: number; captionId: string }) => void
  onVoteSuccess?: (result: { direction: number; captionId: string }) => void
}) {
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVote = useCallback(async (newValue: number) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const previousUserVote = userVote
    const resolvedValue = userVote === newValue ? 0 : newValue

    setUserVote(resolvedValue)
    if (onVoteOptimistic) onVoteOptimistic({ direction: resolvedValue, captionId })

    const result = await submitVote(captionId, resolvedValue)

    if (result?.error) {
      alert(result.error)
      setUserVote(previousUserVote)
      if (onVoteOptimistic) onVoteOptimistic({ direction: previousUserVote, captionId })
      setIsSubmitting(false)
      return
    }

    if (onVoteSuccess) onVoteSuccess({ direction: resolvedValue, captionId })

    // For a non-zero vote the advance timer is already ticking (started in onVoteOptimistic).
    // The component will unmount when the caption changes, so we don't reset isSubmitting —
    // keeping it true closes the toggle window while the 180ms animation plays out.
    // For an unvote (0) there is no advance, so we must reset here to allow a follow-up vote.
    if (resolvedValue === 0) setIsSubmitting(false)
  }, [captionId, isSubmitting, onVoteOptimistic, onVoteSuccess, userVote])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') {
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault()
        void handleVote(1)
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault()
        void handleVote(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleVote])

  return (
    <div className="vote-wrapper">
      <div className="vote-container vote-container-simple">
        <button
          onClick={() => void handleVote(-1)}
          className={`vote-btn vote-btn-simple ${userVote === -1 ? 'active' : ''}`}
          disabled={isSubmitting}
          aria-label="Vote down"
        >
          Downvote
        </button>

        <button
          onClick={() => void handleVote(1)}
          className={`vote-btn vote-btn-simple ${userVote === 1 ? 'active' : ''}`}
          disabled={isSubmitting}
          aria-label="Vote up"
        >
          Upvote
        </button>
      </div>
      <p className="vote-key-hint">← ↓ downvote &nbsp;|&nbsp; upvote ↑ →</p>
    </div>
  )
}
