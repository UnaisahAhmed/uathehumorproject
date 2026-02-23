'use client'

import { useState, useEffect } from 'react'
import VoteButtons from '@/components/vote-buttons'
import SignOutButton from '@/components/auth/signout-button'

interface Caption {
  id: string
  content: string
  profile_id: string
  userVote: number
  totalScore: number
}

interface Props {
  captions: Caption[]
  userEmail: string
}

export default function CaptionViewer({ captions, userEmail }: Props) {
  const [index, setIndex] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  const current = captions[index]
  const progress = ((index + 1) / captions.length) * 100

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const goNext = () => {
    if (index < captions.length - 1) {
      setIndex(i => i + 1)
    }
  }

  const goPrev = () => {
    if (index > 0) {
      setIndex(i => i - 1)
    }
  }

  if (!current) {
    return <div>No captions available.</div>
  }

  return (
    <div className="viewer-root">
      {/* Header */}
      <header className="viewer-header">
        <div className="viewer-logo">
          <span className="logo-emoji">😂</span>
          <span className="logo-text">Humor Project</span>
        </div>
        <div className="viewer-header-right">
          <button
            className="dark-toggle"
            onClick={() => setDarkMode(d => !d)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span className="user-chip">
            {userEmail?.split('@')[0]}
          </span>
          <SignOutButton />
        </div>
      </header>

      {/* Progress */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-label">
        {index + 1} / {captions.length}
      </div>

      {/* Card */}
      <main className="viewer-main">
        <div className="caption-card-new">
          <div className="card-number">
            #{index + 1}
          </div>

          <p className="card-content">
            {current.content}
          </p>

          <div className="card-footer">
            <span className="card-author">
              by {current.profile_id.slice(0, 6)}…
            </span>

            <VoteButtons
              key={current.id}
              captionId={current.id}
              initialUserVote={current.userVote}
              initialVoteCount={current.totalScore}
              onVoteSuccess={goNext} // ✅ auto-next
            />
          </div>
        </div>

<div className="nav-buttons">
  <button
    className="nav-btn nav-prev"
    onClick={goPrev}
    disabled={index === 0}
  >
    ← Previous
  </button>

  <button
    className="nav-btn nav-next"
    onClick={goNext}
    disabled={index === captions.length - 1}
  >
    Next →
  </button>
</div>

      </main>
    </div>
  )
}