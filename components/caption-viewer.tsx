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
  const captionsLeft = Math.max(captions.length - (index + 1), 0)

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
          <Link href="/choose" className="mock-brand" aria-label="Go to home"><span>THE </span><span className="brand-accent">HUMOR</span><span> PROJECT</span></Link>
          <nav className="mock-nav">
            <Link href="/rate">Rate</Link>
            <Link href="/upload">Create</Link>
            <span className="user-chip">{userEmail?.split('@')[0]}</span>
            <SignOutButton />
          </nav>
        </header>
        <main className="rate-main">
          <p>No public captions with images are available yet.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="rate-root">
      <header className="mock-topbar">
        <Link href="/choose" className="mock-brand" aria-label="Go to home"><span>THE </span><span className="brand-accent">HUMOR</span><span> PROJECT</span></Link>
        <nav className="mock-nav" aria-label="App sections">
          <Link href="/rate" aria-current="page">Rate</Link>
          <Link href="/upload">Create</Link>
          <span className="user-chip">{userEmail?.split('@')[0]}</span>
          <SignOutButton />
        </nav>
      </header>

      <main className="rate-main compact-main">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <section className={`rate-focus-stack ${swipeDirection === 'left' ? 'card-swipe-left' : ''} ${swipeDirection === 'right' ? 'card-swipe-right' : ''}`}>
          <div className="rate-image-stage">
            <button className="image-nav-btn image-nav-left" onClick={goPrev} disabled={index === 0} aria-label="Previous caption">
              ←
            </button>
            {current.imageUrl ? (
              <img src={current.imageUrl} alt="Caption image" className="rate-image-focus" />
            ) : null}
            <button className="image-nav-btn image-nav-right" onClick={goNext} disabled={index === captions.length - 1} aria-label="Next caption">
              →
            </button>
          </div>

          <p className="rate-caption-focus">{current.content}</p>

          <div className="rate-actions-focus">
            <VoteButtons
              key={current.id}
              captionId={current.id}
              initialUserVote={current.userVote}
              onVoteSuccess={handleVoteSuccess}
            />
          </div>

          <p className="rate-meta-focus">{captionsLeft} captions left</p>
          {captionsLeft === 0 ? <p className="rate-finished">All captions rated</p> : null}
        </section>
      </main>
    </div>
  )
}
