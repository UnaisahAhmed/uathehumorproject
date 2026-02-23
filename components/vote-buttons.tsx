'use client'

import { useState, useEffect } from 'react'
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
  onVoteSuccess?: () => void
}) {
  const [userVote, setUserVote] = useState(initialUserVote)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setUserVote(initialUserVote)
    setVoteCount(initialVoteCount)
  }, [captionId, initialUserVote, initialVoteCount])

  const handleVote = async (newValue: number) => {
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

    if (onVoteSuccess) onVoteSuccess()
    setIsSubmitting(false)
  }

  return (
    <div className="vote-container">
      <button
        onClick={() => handleVote(1)}
        className={`vote-btn ${userVote === 1 ? 'active' : ''}`}
        disabled={isSubmitting}
        aria-label="Upvote"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
        </svg>
      </button>

      <span className="vote-count">
        {voteCount > 0 ? `+${voteCount}` : voteCount}
      </span>

      <button
        onClick={() => handleVote(-1)}
        className={`vote-btn ${userVote === -1 ? 'active' : ''}`}
        disabled={isSubmitting}
        aria-label="Downvote"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
  )
}