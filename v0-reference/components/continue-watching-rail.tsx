"use client"

import Image from "next/image"
import { continueWatching } from "@/lib/drama-data"

interface ContinueWatchingRailProps {
  onDramaTap?: (id: string) => void
}

export function ContinueWatchingRail({ onDramaTap }: ContinueWatchingRailProps) {
  return (
    <section className="flex flex-col gap-3" aria-label="Continue Watching">
      <h3 className="text-lg font-semibold text-foreground px-4">
        Continue Watching
      </h3>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 snap-x snap-mandatory pb-1">
        {continueWatching.map((drama) => (
          <button
            key={drama.id}
            onClick={() => onDramaTap?.(drama.id)}
            className="flex-shrink-0 flex flex-col gap-2 group transition-transform active:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            aria-label={`Continue watching ${drama.title}, ${drama.episode}, ${drama.progress}% complete`}
          >
            {/* Card */}
            <div className="relative w-[130px] h-[231px] rounded-lg overflow-hidden border border-border/50 snap-start">
              <Image
                src={drama.image}
                alt={drama.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="130px"
              />
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
                <div
                  className="h-full bg-primary rounded-r-full animate-progress-fill"
                  style={{ "--progress-width": `${drama.progress}%`, width: `${drama.progress}%` } as React.CSSProperties}
                />
              </div>
              {/* Progress percent */}
              <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-foreground bg-background/70 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {drama.progress}%
              </span>
            </div>
            {/* Info */}
            <div className="w-[130px] text-left">
              <p className="text-xs font-medium text-foreground truncate">
                {drama.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {drama.episode}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
