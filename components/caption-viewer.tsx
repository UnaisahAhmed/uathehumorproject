'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import VoteButtons from '@/components/vote-buttons'
import SignOutButton from '@/components/auth/signout-button'

interface Caption {
  id: string
  content: string
  profile_id: string
  imageUrl?: string
  userVote: number
  totalScore: number
}

interface Props {
  captions: Caption[]
  userEmail: string
}

export default function CaptionViewer({ captions, userEmail }: Props) {
  const [index, setIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const swipeTimerRef = useRef<number | null>(null)

  const current = captions[index]
  const progress = captions.length ? ((index + 1) / captions.length) * 100 : 0

  useEffect(() => {
    document.body.setAttribute('data-theme', 'light')
  }, [])

  useEffect(() => {
    return () => {
      if (swipeTimerRef.current) {
        window.clearTimeout(swipeTimerRef.current)
      }
    }
  }, [])

  const goNext = () => {
    if (index < captions.length - 1) {
      setIndex((i) => i + 1)
    }
  }

  const goPrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1)
    }
  }

  const handleVoteSuccess = (direction: number) => {
    if (direction === 0) {
      return
    }

    setSwipeDirection(direction > 0 ? 'right' : 'left')

    if (swipeTimerRef.current) {
      window.clearTimeout(swipeTimerRef.current)
    }

    swipeTimerRef.current = window.setTimeout(() => {
      goNext()
      setSwipeDirection(null)
    }, 180)
  }

  if (!current) {
    return (
      <div className="rate-root">
        <header className="mock-topbar">
          <p className="mock-brand"><span>THE </span><span className="brand-accent">HUMOR</span><span> PROJECT</span></p>
          <nav className="mock-nav">
            <Link href="/rate">RATE</Link>
            <Link href="/upload">CREATE</Link>
            <SignOutButton />
          </nav>
        </header>
        <main className="rate-main">
          <h1 className="page-label">rate page</h1>
          <p>No public captions with images are available yet.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="rate-root">
      <header className="mock-topbar">
        <p className="mock-brand"><span>THE </span><span className="brand-accent">HUMOR</span><span> PROJECT</span></p>
        <nav className="mock-nav" aria-label="App sections">
          <Link href="/rate" aria-current="page">RATE</Link>
          <Link href="/upload">CREATE</Link>
          <Link href="/choose">HOME</Link>
          <SignOutButton />
        </nav>
      </header>

      <main className="rate-main">
        <h1 className="page-label">rate page</h1>

        <section className={`rate-center-single ${swipeDirection === 'left' ? 'card-swipe-left' : ''} ${swipeDirection === 'right' ? 'card-swipe-right' : ''}`}>
          <div className="rate-index">#{index + 1}</div>
          {current.imageUrl ? (
            <img src={current.imageUrl} alt="Caption image" className="center-image" />
          ) : null}

          <p className="center-caption">{current.content}</p>

          <div className="center-vote-row">
            <span>NOT FUNNY</span>
            <VoteButtons
              key={current.id}
              captionId={current.id}
              initialUserVote={current.userVote}
              initialVoteCount={current.totalScore}
              onVoteSuccess={handleVoteSuccess}
            />
            <span>FUNNY</span>
          </div>

          <p className="vote-hint">{userEmail?.split('@')[0]} | Use arrow keys too.</p>
        </section>

        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="progress-label">{index + 1} / {captions.length}</div>

        <div className="nav-buttons">
          <button className="nav-btn" onClick={goPrev} disabled={index === 0}>← Previous</button>
          <button className="nav-btn nav-next" onClick={goNext} disabled={index === captions.length - 1}>Next →</button>
        </div>
      </main>
    </div>
  )
}
