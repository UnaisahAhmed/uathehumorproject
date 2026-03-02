'use client'

import { useCallback, useEffect, useState } from 'react'
import { submitVote } from '@/app/actions/vote'

export default function VoteButtons({
  captionId,
  initialUserVote = 0,
  initialVoteCount = 0,
  onVoteSuccess
}: {
  captionId: string
  initialUserVote?: number
  initialVoteCount?: number
  onVoteSuccess?: (direction: number) => void
}) {
  const [userVote, setUserVote] = useState(initialUserVote)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVote = useCallback(async (newValue: number) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const previousUserVote = userVote
    const previousVoteCount = voteCount

    const resolvedValue = userVote === newValue ? 0 : newValue
    const diff = resolvedValue - userVote

    setUserVote(resolvedValue)
    setVoteCount(prev => prev + diff)

    const result = await submitVote(captionId, resolvedValue)

    if (result?.error) {
      alert(result.error)
      setUserVote(previousUserVote)
      setVoteCount(previousVoteCount)
      setIsSubmitting(false)
      return
    }

    if (onVoteSuccess) onVoteSuccess(resolvedValue)
    setIsSubmitting(false)
  }, [captionId, isSubmitting, onVoteSuccess, userVote, voteCount])

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
    <div className="vote-container vote-container-wide">
      <button
        onClick={() => void handleVote(-1)}
        className={`vote-btn vote-btn-wide ${userVote === -1 ? 'active' : ''}`}
        disabled={isSubmitting}
        aria-label="Vote down"
      >
        ← Not Funny
      </button>

      <span className="vote-count">
        {voteCount > 0 ? `+${voteCount}` : voteCount}
      </span>

      <button
        onClick={() => void handleVote(1)}
        className={`vote-btn vote-btn-wide ${userVote === 1 ? 'active' : ''}`}
        disabled={isSubmitting}
        aria-label="Vote up"
      >
        Funny →
      </button>
    </div>
  )
}
