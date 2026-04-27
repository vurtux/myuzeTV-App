"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Play, Volume2, VolumeOff } from "lucide-react"
import { heroFeatured } from "@/lib/drama-data"

interface HeroUnitProps {
  onDramaTap?: (id: string) => void
}

export function HeroUnit({ onDramaTap }: HeroUnitProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const isScrollingRef = useRef(false)

  const CARD_WIDTH = 200
  const CARD_GAP = 12

  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const container = scrollRef.current
      if (!container) return
      const containerWidth = container.offsetWidth
      const scrollTarget =
        index * (CARD_WIDTH + CARD_GAP) -
        (containerWidth - CARD_WIDTH) / 2
      container.scrollTo({
        left: scrollTarget,
        behavior: smooth ? "smooth" : "auto",
      })
    },
    []
  )

  // Set initial scroll position to center first card
  useEffect(() => {
    // Small delay to let layout compute
    const t = setTimeout(() => scrollToIndex(0, false), 50)
    return () => clearTimeout(t)
  }, [scrollToIndex])

  // Detect which card is centered on scroll end
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let timeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      isScrollingRef.current = true
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        isScrollingRef.current = false
        const containerWidth = container.offsetWidth
        const scrollLeft = container.scrollLeft
        const center = scrollLeft + containerWidth / 2
        const idx = Math.round(
          (center - CARD_WIDTH / 2) / (CARD_WIDTH + CARD_GAP)
        )
        const clamped = Math.max(0, Math.min(heroFeatured.length - 1, idx))
        setActiveIndex(clamped)
      }, 80)
    }
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      container.removeEventListener("scroll", handleScroll)
      clearTimeout(timeout)
    }
  }, [])

  // Auto-advance every 5s if not scrolling
  useEffect(() => {
    const timer = setInterval(() => {
      if (isScrollingRef.current) return
      setActiveIndex((prev) => {
        const next = (prev + 1) % heroFeatured.length
        scrollToIndex(next)
        return next
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [scrollToIndex])

  const featured = heroFeatured[activeIndex]

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev
      videoRefs.current.forEach((v) => {
        if (v) v.muted = next
      })
      return next
    })
  }

  const handleCardTap = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index)
      scrollToIndex(index)
    }
  }

  // Total scroll width needed for centering the last card
  const totalPadding =
    typeof window !== "undefined"
      ? `calc((100% - ${CARD_WIDTH}px) / 2)`
      : "96px"

  return (
    <section className="flex flex-col gap-3 pt-4" aria-label="Featured drama trailers">
      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
        style={{
          paddingLeft: totalPadding,
          paddingRight: totalPadding,
        }}
      >
        {heroFeatured.map((drama, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={drama.id}
              onClick={() => handleCardTap(i)}
              className="flex-shrink-0 snap-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
              style={{ width: CARD_WIDTH }}
              aria-label={`${drama.title} trailer`}
            >
              <div
                className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out ${
                  isActive
                    ? "border-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.25)] scale-100 opacity-100"
                    : "border-border/40 scale-[0.92] opacity-50"
                }`}
                style={{ aspectRatio: "9 / 16" }}
              >
                {/* Video for active card */}
                {isActive && (
                  <video
                    ref={(el) => { videoRefs.current[i] = el }}
                    className="absolute inset-0 w-full h-full object-cover"
                    poster={drama.image}
                    muted={isMuted}
                    autoPlay
                    playsInline
                    loop
                  />
                )}

                {/* Poster image */}
                <Image
                  src={drama.image}
                  alt={drama.title}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-100"
                  }`}
                  sizes="200px"
                  priority={i < 3}
                />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Mute toggle on active */}
                {isActive && (
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMute()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation()
                          toggleMute()
                        }
                      }}
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-foreground"
                      aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
                    >
                      {isMuted ? (
                        <VolumeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>
                )}

                {/* Title on card */}
                <div className="absolute bottom-0 inset-x-0 px-3 pb-3 z-10">
                  <p className="text-xs font-medium text-white/60 mb-0.5">
                    {drama.genre}
                  </p>
                  <h3 className="text-sm font-bold text-white leading-tight text-balance">
                    {drama.title}
                  </h3>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom info for active card */}
      <div className="flex flex-col items-center gap-2.5 px-6">
        {/* CTA */}
        <button
          className="flex items-center justify-center gap-2 w-full max-w-[280px] py-2.5 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground font-semibold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.35)] transition-transform active:scale-[0.97]"
          onClick={() => onDramaTap?.(featured.id)}
          aria-label={`Watch Episode 1 of ${featured.title} for free`}
        >
          <Play className="w-4 h-4 fill-current" />
          {"Watch Ep 1 \u00B7 FREE"}
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-1.5" role="tablist" aria-label="Featured dramas">
          {heroFeatured.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show drama ${i + 1}`}
              onClick={() => {
                setActiveIndex(i)
                scrollToIndex(i)
              }}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "bg-primary w-5 h-1.5"
                  : "bg-foreground/20 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
