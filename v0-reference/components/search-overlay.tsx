"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Image from "next/image"
import { Search, X, TrendingUp } from "lucide-react"
import {
  trendingNow,
  newThisWeek,
  romanceDramas,
  fantasyDramas,
  continueWatching,
  heroFeatured,
  type Drama,
} from "@/lib/drama-data"

const allDramas: Drama[] = [
  ...heroFeatured,
  ...continueWatching,
  ...trendingNow,
  ...newThisWeek,
  ...romanceDramas,
  ...fantasyDramas,
]

// Deduplicate by id
const uniqueDramas = allDramas.filter(
  (drama, index, self) => self.findIndex((d) => d.id === drama.id) === index
)

const trendingSearches = [
  "Love in Accra",
  "CEO Secret",
  "Juju Rising",
  "Palace Wife",
  "Gold Coast",
]

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
  onDramaTap?: (id: string) => void
}

export function SearchOverlay({ open, onClose, onDramaTap }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return uniqueDramas.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.genre.toLowerCase().includes(q)
    )
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex flex-col max-w-[430px] mx-auto">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex-1 flex items-center gap-2.5 bg-card border border-border rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dramas, genres..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-sm font-medium text-primary"
        >
          Cancel
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {query.trim() === "" ? (
          /* Trending searches */
          <div className="flex flex-col gap-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trending searches
            </h3>
            <div className="flex flex-col">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-3 py-3 border-b border-border/50 text-left"
                >
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{term}</span>
                </button>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          /* Search results */
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((drama) => (
              <button
                key={drama.id}
                onClick={() => onDramaTap?.(drama.id)}
                className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-card text-left"
              >
                <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-border/50 flex-shrink-0">
                  <Image
                    src={drama.image}
                    alt={drama.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {drama.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{drama.genre}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* No results */
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <Search className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {"No dramas found for \""}{query}{"\""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
