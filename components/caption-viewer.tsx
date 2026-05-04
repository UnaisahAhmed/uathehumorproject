'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import VoteButtons from '@/components/vote-buttons'
import SignOutButton from '@/components/auth/signout-button'

const SESSION_SIZE = 14

interface Caption {
  id: string
  content: string
  profile_id: string
  imageUrl?: string
  userVote: number
  totalScore: number
}

interface Session {
  captionIds: string[]
  startedAt: string
}

interface Props {
  captions: Caption[]
  userEmail: string
  userId: string
}

function loadSession(userId: string): Session | null {
  try {
    const raw = localStorage.getItem(`rating_session_${userId}`)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function saveSession(userId: string, session: Session): void {
  try {
    localStorage.setItem(`rating_session_${userId}`, JSON.stringify(session))
  } catch {
    // ignore storage errors
  }
}

function clearSession(userId: string): void {
  try {
    localStorage.removeItem(`rating_session_${userId}`)
  } catch {
    // ignore storage errors
  }
}

export default function CaptionViewer({ captions, userEmail, userId }: Props) {
  const captionsRef = useRef(captions)
  const userIdRef = useRef(userId)

  const [sessionCaptions, setSessionCaptions] = useState<Caption[]>([])
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [votesByCaption, setVotesByCaption] = useState<Map<string, number>>(new Map())
  const [index, setIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [erroredImageId, setErroredImageId] = useState<string | null>(null)
  const swipeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.body.setAttribute('data-theme', 'light')
  }, [])

  useEffect(() => {
    return () => {
      if (swipeTimerRef.current !== null) window.clearTimeout(swipeTimerRef.current)
    }
  }, [])

  // Load or create the session of 25 on mount
  useEffect(() => {
    const allCaptions = captionsRef.current
    const uid = userIdRef.current
    let sessionCaps: Caption[] = []

    const existing = loadSession(uid)
    if (existing?.captionIds?.length) {
      const captionMap = new Map(allCaptions.map((c) => [c.id, c]))
      const resolved = existing.captionIds
        .map((id) => captionMap.get(id))
        .filter((c): c is Caption => c !== undefined)

      // Resume only if at least one caption is still unvoted
      if (resolved.length > 0 && resolved.some((c) => c.userVote === 0)) {
        sessionCaps = resolved
      }
    }

    if (sessionCaps.length === 0) {
      // Previous session complete (or none exists) — pick a fresh set of unrated captions
      const unrated = allCaptions.filter((c) => c.userVote === 0)
      const shuffled = [...unrated]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      sessionCaps = shuffled.slice(0, SESSION_SIZE)

      if (sessionCaps.length > 0) {
        saveSession(uid, {
          captionIds: sessionCaps.map((c) => c.id),
          startedAt: new Date().toISOString(),
        })
      }
    }

    // Start at the first meme that hasn't been voted on yet (saves the user scrolling past rated ones on reload)
    const firstUnvoted = sessionCaps.findIndex((c) => c.userVote === 0)

    startTransition(() => {
      setSessionCaptions(sessionCaps)
      setVotesByCaption(new Map(sessionCaps.map((c) => [c.id, c.userVote])))
      setIndex(firstUnvoted >= 0 ? firstUnvoted : 0)
      setSessionLoaded(true)
    })
  }, [])

  // Cancels any pending auto-advance, then navigates forward.
  // Clearing the timer prevents the timer from firing on top of a manual navigation.
  const goNext = () => {
    if (swipeTimerRef.current !== null) {
      window.clearTimeout(swipeTimerRef.current)
      swipeTimerRef.current = null
      setSwipeDirection(null)
    }
    setIndex((i) => (i < sessionCaptions.length - 1 ? i + 1 : i))
  }

  const goPrev = () => {
    if (swipeTimerRef.current !== null) {
      window.clearTimeout(swipeTimerRef.current)
      swipeTimerRef.current = null
      setSwipeDirection(null)
    }
    setIndex((i) => (i > 0 ? i - 1 : 0))
  }

  // Fires immediately on click — updates counter, progress bar, and starts the advance animation.
  // Starting the advance here (not after the server responds) keeps isSubmitting=true in VoteButtons
  // for the full 180 ms animation window, preventing key-repeat from toggling the same caption.
  const handleVoteOptimistic = ({ direction, captionId }: { direction: number; captionId: string }) => {
    let nextRatedCount = 0
    setVotesByCaption((prev) => {
      const next = new Map(prev)
      next.set(captionId, direction)
      nextRatedCount = [...next.values()].filter((v) => v !== 0).length
      return next
    })

    if (nextRatedCount === sessionCaptions.length) {
      clearSession(userId)
    }

    if (direction === 0) return

    const len = sessionCaptions.length
    setSwipeDirection(direction > 0 ? 'right' : 'left')
    if (swipeTimerRef.current !== null) window.clearTimeout(swipeTimerRef.current)

    swipeTimerRef.current = window.setTimeout(() => {
      setIndex((i) => (i < len - 1 ? i + 1 : i))
      setSwipeDirection(null)
      swipeTimerRef.current = null
    }, 180)
  }

  // Server has confirmed — nothing left to do for UX (advance already in progress).
  const handleVoteSuccess = () => {}

  const topbar = (
    <header className="mock-topbar">
      <Link href="/choose" className="mock-brand" aria-label="Go to home">
        <span>THE </span>
        <span className="brand-accent">HUMOR</span>
        <span> PROJECT</span>
      </Link>
      <nav className="mock-nav" aria-label="App sections">
        <Link href="/rate" aria-current="page">Rate</Link>
        <Link href="/upload">Create</Link>
        <span className="user-chip">{userEmail?.split('@')[0]}</span>
        <SignOutButton />
      </nav>
    </header>
  )

  if (!sessionLoaded) {
    return (
      <div className="rate-root">
        {topbar}
        <main className="rate-main">
          <p className="rate-loading">Loading your set&hellip;</p>
        </main>
      </div>
    )
  }

  if (sessionCaptions.length === 0) {
    return (
      <div className="rate-root">
        {topbar}
        <main className="rate-main compact-main">
          <div className="all-done-state">
            <h2>All Done!</h2>
            <p>
              You&apos;ve rated everything available right now. Check back later
              for new captions, or upload your own!
            </p>
            <Link href="/upload" className="nav-btn nav-next">
              Upload a new image
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const current = sessionCaptions[index]
  const currentVote = votesByCaption.get(current?.id) ?? 0
  const hasImageError = erroredImageId === current?.id
  const ratedCount = [...votesByCaption.values()].filter((v) => v !== 0).length
  const isSessionComplete = sessionCaptions.length > 0 && ratedCount === sessionCaptions.length
  const progress = sessionCaptions.length > 0 ? (ratedCount / sessionCaptions.length) * 100 : 0

  if (isSessionComplete) {
    return (
      <div className="rate-root">
        {topbar}
        <main className="rate-main compact-main">
          <div className="all-done-state">
            <h2>All captions rated</h2>
            <p>
              You finished this set of {sessionCaptions.length} memes. Log back in
              for a fresh unrated batch, or upload your own image next.
            </p>
            <Link href="/upload" className="nav-btn nav-next">
              Upload a new image
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="rate-root">
      {topbar}

      <main className="rate-main compact-main">
        <div className="session-counter">
          {ratedCount} of {sessionCaptions.length} rated
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <section
          className={`rate-focus-stack${swipeDirection === 'left' ? ' card-swipe-left' : ''}${swipeDirection === 'right' ? ' card-swipe-right' : ''}`}
        >
          <div className="rate-image-stage">
            <button
              className="image-nav-btn image-nav-left"
              onClick={goPrev}
              disabled={index === 0}
              aria-label="Previous caption"
            >
              ←
            </button>
            {current.imageUrl && !hasImageError ? (
              <img
                key={current.id}
                src={current.imageUrl}
                alt="Caption image"
                className="rate-image-focus"
                onError={() => setErroredImageId(current.id)}
              />
            ) : (
              <div key={current.id} className="rate-image-missing">Image unavailable</div>
            )}
            <button
              className="image-nav-btn image-nav-right"
              onClick={goNext}
              disabled={index === sessionCaptions.length - 1}
              aria-label="Next caption"
            >
              →
            </button>
          </div>

          <p className="rate-caption-focus">{current.content}</p>

          <div className="rate-actions-focus">
            <VoteButtons
              key={current.id}
              captionId={current.id}
              initialUserVote={currentVote}
              onVoteOptimistic={handleVoteOptimistic}
              onVoteSuccess={handleVoteSuccess}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
