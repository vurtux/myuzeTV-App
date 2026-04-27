"use client"

import Image from "next/image"
import type { Drama } from "@/lib/drama-data"

interface DramaRailProps {
  title: string
  dramas: Drama[]
  variant?: "trending" | "new" | "default"
  onDramaTap?: (id: string) => void
}

export function DramaRail({ title, dramas, variant = "default", onDramaTap }: DramaRailProps) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h3 className="text-lg font-semibold text-foreground px-4">
        {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 snap-x snap-mandatory pb-1">
        {dramas.map((drama) => (
          <button
            key={drama.id}
            onClick={() => onDramaTap?.(drama.id)}
            className="flex-shrink-0 flex flex-col gap-2 group transition-transform active:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            aria-label={`${drama.title} - ${drama.genre}`}
          >
            {/* Card */}
            <div className="relative w-[110px] h-[196px] rounded-lg overflow-hidden border border-border/50 snap-start">
              <Image
                src={drama.image}
                alt={drama.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="110px"
              />

              {/* Trending Badge */}
              {variant === "trending" && drama.watching && (
                <span className="absolute top-2 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[hsl(var(--destructive))] to-orange-500 text-[9px] font-bold text-foreground shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                  <span aria-hidden="true">{"🔥"}</span>
                  <span>{drama.watching}</span>
                  <span className="sr-only">people watching</span>
                </span>
              )}

              {/* New Badge */}
              {variant === "new" && drama.isNew && (
                <span className="absolute top-2 left-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[hsl(var(--badge-green))] to-emerald-400 text-[9px] font-bold text-foreground animate-pulse-badge shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  NEW
                </span>
              )}
            </div>

            {/* Info */}
            <div className="w-[110px] text-left">
              <p className="text-xs font-medium text-foreground truncate">
                {drama.title}
              </p>
              {variant === "new" && drama.releasedAgo ? (
                <p className="text-[10px] text-muted-foreground truncate">
                  {drama.releasedAgo}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground">
                  {drama.genre}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
