"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { Bookmark, X } from "lucide-react"
import { watchlistDramas, type WatchlistDrama } from "@/lib/watchlist-data"

const filterChips = ["All", "Romance", "Fantasy", "Thriller", "In Progress"] as const

interface WatchlistScreenProps {
  onDramaTap?: (id: string) => void
}

export function WatchlistScreen({ onDramaTap }: WatchlistScreenProps) {
  const [dramas, setDramas] = useState<WatchlistDrama[]>(watchlistDramas)
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const filteredDramas = dramas.filter((d) => {
    if (activeFilter === "All") return true
    if (activeFilter === "In Progress") return d.watchedEpisodes && d.watchedEpisodes > 0
    return d.genre.toLowerCase().includes(activeFilter.toLowerCase())
  })

  const handleRemove = useCallback(
    (id: string, title: string) => {
      setRemovingId(id)
      setTimeout(() => {
        setDramas((prev) => prev.filter((d) => d.id !== id))
        setRemovingId(null)
        setToast(`Removed "${title}" from watchlist`)
        setTimeout(() => setToast(null), 2500)
      }, 300)
    },
    []
  )

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between h-[60px] px-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <h1 className="text-[22px] font-bold text-foreground">My Watchlist</h1>
        <span className="text-sm text-muted-foreground">
          {dramas.length} dramas
        </span>
      </header>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`flex-shrink-0 h-8 px-3.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === chip
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border/50 hover:text-foreground"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Content */}
      {filteredDramas.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground text-center">
            Your watchlist is empty
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Add dramas to watch them later
          </p>
          <button className="h-12 px-8 rounded-xl border border-primary text-primary font-semibold text-sm transition-transform active:scale-95">
            Browse Dramas
          </button>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-1">
          {filteredDramas.map((drama, i) => (
            <WatchlistCard
              key={drama.id}
              drama={drama}
              index={i}
              removing={removingId === drama.id}
              onTap={() => onDramaTap?.(drama.id)}
              onRemove={() => handleRemove(drama.id, drama.title)}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-card border border-border/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <p className="text-xs font-medium text-foreground whitespace-nowrap">
            {toast}
          </p>
        </div>
      )}
    </div>
  )
}

/* ───────── Watchlist Card ───────── */

function WatchlistCard({
  drama,
  index,
  removing,
  onTap,
  onRemove,
}: {
  drama: WatchlistDrama
  index: number
  removing: boolean
  onTap: () => void
  onRemove: () => void
}) {
  const progress = drama.watchedEpisodes
    ? Math.round((drama.watchedEpisodes / drama.episodeCount) * 100)
    : 0

  return (
    <button
      onClick={onTap}
      className="relative flex flex-col text-left group transition-all duration-300 active:scale-[0.97]"
      style={{
        animationDelay: `${index * 50}ms`,
        opacity: removing ? 0 : 1,
        transform: removing ? "scale(0.9)" : "scale(1)",
      }}
    >
      <div
        className="relative w-full rounded-xl overflow-hidden border border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        style={{ aspectRatio: "9 / 16" }}
      >
        <Image
          src={drama.image}
          alt={drama.title}
          fill
          className="object-cover"
          sizes="(max-width: 430px) 50vw, 200px"
        />

        {/* Remove button */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation()
              onRemove()
            }
          }}
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/60 transition-all hover:bg-destructive/80 hover:text-white hover:border-destructive/50 active:scale-90"
          aria-label={`Remove ${drama.title} from watchlist`}
        >
          <X className="w-3.5 h-3.5" />
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Overlay content */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-10 flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-white leading-tight line-clamp-2">
            {drama.title}
          </p>
          <p className="text-[11px] text-white/50">
            {drama.episodeCount} eps &middot; {drama.genre}
          </p>

          {/* Progress bar */}
          {drama.watchedEpisodes && drama.watchedEpisodes > 0 && (
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="relative w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary animate-progress-fill"
                  style={
                    {
                      "--progress-width": `${progress}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
              <p className="text-[10px] text-white/40">
                Watched {drama.watchedEpisodes} of {drama.episodeCount}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
