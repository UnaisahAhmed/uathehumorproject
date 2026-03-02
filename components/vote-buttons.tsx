'use client'

import { useCallback, useEffect, useState } from 'react'
import { submitVote } from '@/app/actions/vote'

export default function VoteButtons({
  captionId,
  initialUserVote = 0,
  onVoteSuccess
}: {
  captionId: string
  initialUserVote?: number
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

    const result = await submitVote(captionId, resolvedValue)

    if (result?.error) {
      alert(result.error)
      setUserVote(previousUserVote)
      setIsSubmitting(false)
      return
    }

    if (onVoteSuccess) onVoteSuccess({ direction: resolvedValue, captionId })
    setIsSubmitting(false)
  }, [captionId, isSubmitting, onVoteSuccess, userVote])

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
  )
}
