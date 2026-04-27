"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Share2,
  Heart,
  Play,
  Pause,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Coins,
  Layers,
} from "lucide-react"
import { getDramaDetail } from "@/lib/drama-detail-data"
import type { Episode } from "@/lib/drama-detail-data"
import { SubscriptionPaywall } from "@/components/subscription-paywall"

interface VerticalPlayerProps {
  dramaId: string
  startEpisodeIndex?: number
  onClose: () => void
}

export function VerticalPlayer({
  dramaId,
  startEpisodeIndex = 0,
  onClose,
}: VerticalPlayerProps) {
  const detail = getDramaDetail(dramaId)
  const [currentIndex, setCurrentIndex] = useState(startEpisodeIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12500)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [autoPlayNext, setAutoPlayNext] = useState(true)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [doubleTapSide, setDoubleTapSide] = useState<"left" | "right" | null>(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [episodeDrawerOpen, setEpisodeDrawerOpen] = useState(false)

  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartY = useRef(0)
  const lastTapTime = useRef(0)
  const lastTapX = useRef(0)

  const currentEpisode = detail.episodes[currentIndex] || detail.episodes[0]
  const totalSeconds = parseDuration(currentEpisode.duration)
  const isLocked = currentEpisode.status === "locked"

  const prevEpisode = currentIndex > 0 ? detail.episodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex < detail.episodes.length - 1
      ? detail.episodes[currentIndex + 1]
      : null

  // Auto-hide controls after 3s
  const resetControlsTimer = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    if (isPlaying) {
      controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000)
    }
  }, [isPlaying])

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying && !isLocked) {
      progressTimer.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 0.1
          const total = totalSeconds
          setProgress((next / total) * 100)
          if (next >= total) {
            // Episode finished
            setIsPlaying(false)
            if (autoPlayNext && nextEpisode) {
              setShowCountdown(true)
              setCountdown(5)
            }
            return total
          }
          return next
        })
      }, 100)
    }
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current)
    }
  }, [isPlaying, isLocked, totalSeconds, autoPlayNext, nextEpisode])

  // Countdown timer
  useEffect(() => {
    if (!showCountdown) return
    if (countdown <= 0) {
      setShowCountdown(false)
      goToEpisode(currentIndex + 1)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [showCountdown, countdown, currentIndex])

  // Controls auto-hide
  useEffect(() => {
    if (controlsVisible && isPlaying) {
      resetControlsTimer()
    }
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current)
    }
  }, [controlsVisible, isPlaying, resetControlsTimer])

  // Swipe hint on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(true)
      setTimeout(() => setShowSwipeHint(false), 2000)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  function goToEpisode(index: number) {
    if (index < 0 || index >= detail.episodes.length) return
    setCurrentIndex(index)
    setProgress(0)
    setCurrentTime(0)
    setIsPlaying(true)
    setControlsVisible(true)
    setShowCountdown(false)
    setLiked(false)
  }

  function toggleControls() {
    setControlsVisible((v) => !v)
    if (!controlsVisible) resetControlsTimer()
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p)
    setControlsVisible(true)
    resetControlsTimer()
  }

  // Handle taps -- single tap toggles controls, double tap seeks
  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const now = Date.now()
    const x = e.clientX
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (x - rect.left) / rect.width

    if (now - lastTapTime.current < 300 && Math.abs(x - lastTapX.current) < 50) {
      // Double tap
      if (pct < 0.4) {
        setDoubleTapSide("left")
        setCurrentTime((t) => Math.max(0, t - 10))
        setTimeout(() => setDoubleTapSide(null), 800)
      } else if (pct > 0.6) {
        setDoubleTapSide("right")
        setCurrentTime((t) => Math.min(totalSeconds, t + 10))
        setTimeout(() => setDoubleTapSide(null), 800)
      }
      lastTapTime.current = 0
    } else {
      lastTapTime.current = now
      lastTapX.current = x
      // Single tap -- delayed to distinguish from double
      setTimeout(() => {
        if (Date.now() - now >= 280) {
          toggleControls()
        }
      }, 300)
    }
  }

  // Swipe handling
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (delta > 80 && nextEpisode) {
      goToEpisode(currentIndex + 1)
    } else if (delta < -80 && prevEpisode) {
      goToEpisode(currentIndex - 1)
    }
  }

  function handleLike() {
    setLiked((l) => {
      setLikeCount((c) => (l ? c - 1 : c + 1))
      return !l
    })
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  function formatCount(n: number) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K"
    return n.toString()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div
        className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden"
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video / Image background */}
        <div className="absolute inset-0">
          <Image
            src={currentEpisode.image}
            alt={currentEpisode.title}
            fill
            className="object-cover"
            sizes="430px"
            priority
          />
          {/* Dim overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-300" />
          )}
        </div>

        {/* Double-tap ripple feedback */}
        {doubleTapSide && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 z-40 flex items-center justify-center ${
              doubleTapSide === "left" ? "left-12" : "right-12"
            }`}
          >
            <div className="flex flex-col items-center gap-1 animate-ping-once">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-sm">
                  {doubleTapSide === "left" ? "-10s" : "+10s"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Swipe hint */}
        {showSwipeHint && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 animate-fade-hint">
            <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md">
              <span className="text-white text-sm font-medium">
                Swipe up for next episode
              </span>
            </div>
          </div>
        )}

        {/* ── Locked episode overlay ── */}
        {isLocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 px-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white text-center">
                Episode {currentEpisode.number} is Premium
              </h3>
              <p className="text-sm text-white/60 text-center leading-relaxed">
                Unlock this episode and continue watching the story
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPaywallOpen(true)
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white font-semibold text-sm shadow-[0_4px_24px_rgba(139,92,246,0.4)] transition-transform active:scale-95"
              >
                <Coins className="w-4 h-4" />
                Unlock Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="text-sm text-white/40 mt-1"
              >
                Go back
              </button>
            </div>
          </div>
        )}

        {/* ── Top control bar ── */}
        <div
          className={`absolute top-0 inset-x-0 z-20 transition-opacity duration-300 ${
            controlsVisible && !isLocked ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="flex items-center justify-between px-4 pt-12 pb-6"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex-1 mx-3 text-center">
              <p className="text-white text-sm font-semibold truncate">
                Ep {currentEpisode.number}: {currentEpisode.title}
              </p>
            </div>

            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* ── Center play/pause ── */}
        {controlsVisible && !isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlayPause()
              }}
              className="pointer-events-auto flex items-center justify-center w-20 h-20 rounded-full bg-black/30 backdrop-blur-md transition-transform active:scale-90"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-white text-white" />
              ) : (
                <Play className="w-10 h-10 fill-white text-white ml-1" />
              )}
            </button>
          </div>
        )}

        {/* ── Right side action panel (TikTok-style) ── */}
        <div
          className={`absolute right-3 z-20 flex flex-col items-center gap-5 transition-opacity duration-300 ${
            isLocked ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          {/* Like */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLike()
            }}
            className="flex flex-col items-center gap-1 transition-transform active:scale-110"
            aria-label="Like"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                liked ? "bg-red-500/20" : "bg-white/10 backdrop-blur-md"
              }`}
            >
              <Heart
                className={`w-7 h-7 transition-colors ${
                  liked ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </div>
            <span className="text-white text-[11px] font-medium">
              {formatCount(likeCount)}
            </span>
          </button>

          {/* Episodes drawer trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEpisodeDrawerOpen(true)
            }}
            className="flex flex-col items-center gap-1 transition-transform active:scale-110"
            aria-label="Episodes"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[11px] font-medium">Episodes</span>
          </button>

          {/* Share */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1 transition-transform active:scale-110"
            aria-label="Share"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[11px] font-medium">Share</span>
          </button>
        </div>

        {/* ── Bottom control panel ── */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 transition-opacity duration-300 ${
            controlsVisible && !isLocked ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="flex flex-col gap-3 px-4 pt-12 pb-8"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
            }}
          >
            {/* Progress bar */}
            <div
              className="relative w-full h-1 rounded-full bg-white/20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                setProgress(pct * 100)
                setCurrentTime(pct * totalSeconds)
              }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-[hsl(258,90%,50%)]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-lg transition-transform"
                style={{ left: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Time row */}
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium">
                {formatTime(currentTime)}
              </span>
              <span className="text-white/50 text-xs">
                {formatTime(totalSeconds)}
              </span>
            </div>

            {/* Episode navigation row */}
            <div className="flex items-center justify-between gap-2">
              {prevEpisode ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToEpisode(currentIndex - 1)
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md text-white text-xs font-medium transition-transform active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Ep {prevEpisode.number}
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setAutoPlayNext((a) => !a)
                }}
                className="text-[11px] font-medium text-white/40"
              >
                Auto-play: {autoPlayNext ? "ON" : "OFF"}
              </button>

              {nextEpisode ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToEpisode(currentIndex + 1)
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(139,92,246,0.4)] transition-transform active:scale-95"
                >
                  Ep {nextEpisode.number}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>

        {/* ── Auto-play countdown overlay ── */}
        {showCountdown && nextEpisode && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4 w-[280px] p-6 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50">
              <p className="text-lg font-semibold text-white">Next Episode</p>

              <div
                className="relative w-[140px] rounded-xl overflow-hidden border border-border/50"
                style={{ aspectRatio: "9 / 16" }}
              >
                <Image
                  src={nextEpisode.image}
                  alt={nextEpisode.title}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>

              <p className="text-sm text-white/70 text-center">
                Episode {nextEpisode.number}: {nextEpisode.title}
              </p>

              {/* Countdown ring */}
              <div className="relative flex items-center justify-center w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={
                      2 * Math.PI * 28 * (1 - countdown / 5)
                    }
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-primary">
                  {countdown}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowCountdown(false)
                  setIsPlaying(false)
                }}
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Episodes Drawer ── */}
      {episodeDrawerOpen && (
        <div
          className="fixed inset-0 z-[60]"
          onClick={() => setEpisodeDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Drawer */}
          <div
            className="absolute bottom-0 inset-x-0 max-w-[430px] mx-auto bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/50 animate-in slide-in-from-bottom duration-300"
            style={{ maxHeight: "70dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Episodes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {detail.episodeCount} episodes total
                </p>
              </div>
              <button
                onClick={() => setEpisodeDrawerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Episode grid */}
            <div className="overflow-y-auto px-5 pb-8 hide-scrollbar" style={{ maxHeight: "calc(70dvh - 100px)" }}>
              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: detail.episodeCount }, (_, i) => {
                  const epNum = i + 1
                  const epData = detail.episodes.find((e) => e.number === epNum)
                  const isFree = epData ? epData.status !== "locked" : epNum <= 4
                  const isWatched = epData?.status === "watched"
                  const isCurrent = currentIndex === i

                  return (
                    <button
                      key={epNum}
                      onClick={() => {
                        if (!isFree) {
                          setEpisodeDrawerOpen(false)
                          setPaywallOpen(true)
                          return
                        }
                        goToEpisode(i < detail.episodes.length ? i : 0)
                        setEpisodeDrawerOpen(false)
                      }}
                      className={`relative flex items-center justify-center aspect-square rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                        isCurrent
                          ? "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white shadow-[0_2px_12px_rgba(139,92,246,0.4)]"
                          : isWatched
                            ? "bg-white/10 text-white/80"
                            : isFree
                              ? "bg-white/[0.06] text-foreground border border-border/40"
                              : "bg-white/[0.03] text-muted-foreground/50 border border-border/20"
                      }`}
                    >
                      {/* Episode number */}
                      <span className={isCurrent ? "text-sm" : "text-[13px]"}>
                        {epNum}
                      </span>

                      {/* Lock icon for paid episodes */}
                      {!isFree && (
                        <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-muted-foreground/40" />
                      )}

                      {/* Watched dot */}
                      {isWatched && !isCurrent && (
                        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                      )}

                      {/* Currently playing indicator */}
                      {isCurrent && (
                        <div className="absolute -bottom-0.5 flex items-center gap-[2px]">
                          <div className="w-0.5 h-2 rounded-full bg-white animate-pulse" />
                          <div className="w-0.5 h-3 rounded-full bg-white animate-pulse" style={{ animationDelay: "0.15s" }} />
                          <div className="w-0.5 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: "0.3s" }} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Paywall */}
      <SubscriptionPaywall
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        episodeNumber={currentEpisode.number}
        dramaTitle={detail.title}
      />
    </div>
  )
}

function parseDuration(dur: string): number {
  const parts = dur.split(":")
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  return 120
}
