"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  Play,
  Lock,
  Check,
} from "lucide-react"
import { getDramaDetail } from "@/lib/drama-detail-data"
import type { Episode } from "@/lib/drama-detail-data"
import { romanceDramas } from "@/lib/drama-data"
import { SubscriptionPaywall } from "@/components/subscription-paywall"

interface DramaDetailProps {
  dramaId: string
  onBack: () => void
  onNavigate?: (id: string) => void
  onPlay?: (episodeIndex: number) => void
}

export function DramaDetail({ dramaId, onBack, onNavigate, onPlay }: DramaDetailProps) {
  const detail = getDramaDetail(dramaId)
  const [liked, setLiked] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallEpisode, setPaywallEpisode] = useState<number | undefined>()

  const moreLikeThis = romanceDramas.filter((d) => d.id !== dramaId).slice(0, 5)

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      <div className="flex flex-col pb-10">
        {/* 1. Hero Banner - 9:16 portrait centered */}
        <div className="relative w-full flex flex-col items-center pt-12 pb-6 px-4">
          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-12 left-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border/50 text-foreground transition-transform active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Share button */}
          <button
            className="absolute top-12 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border/50 text-foreground transition-transform active:scale-95"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* 9:16 poster card */}
          <div
            className="relative w-[220px] rounded-2xl overflow-hidden border border-border/50 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            style={{ aspectRatio: "9 / 16" }}
          >
            <Image
              src={detail.banner}
              alt={detail.title}
              fill
              className="object-cover"
              sizes="220px"
              priority
            />
            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            {/* Play overlay */}
            <button
              onClick={() => onPlay?.(0)}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Play"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                <Play className="w-6 h-6 fill-foreground text-foreground ml-0.5" />
              </div>
            </button>
            {/* Title on poster */}
            <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
              <p className="text-xs font-medium text-white/60 mb-0.5">
                {detail.genre.join(" \u00B7 ")}
              </p>
              <h2 className="text-base font-bold text-white leading-tight text-balance">
                {detail.title}
              </h2>
            </div>
          </div>
        </div>

        {/* 2. Action Bar */}
        <div className="flex gap-2 px-4 relative z-10">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              liked
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card/80 backdrop-blur-sm border-border text-muted-foreground"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${liked ? "fill-primary" : ""}`}
            />
            <span>{detail.likes}</span>
          </button>

          <button
            className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl border bg-card/80 backdrop-blur-sm border-border text-muted-foreground text-sm font-medium transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setInWatchlist(!inWatchlist)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              inWatchlist
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card/80 backdrop-blur-sm border-border text-muted-foreground"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${inWatchlist ? "fill-primary" : ""}`}
            />
            <span>Watchlist</span>
          </button>
        </div>

        {/* 3. Title & Metadata */}
        <div className="flex flex-col gap-3 px-4 pt-5">
          <h1 className="text-2xl font-bold text-foreground text-balance">
            {detail.title}
          </h1>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2">
            {detail.genre.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Metadata */}
          <p className="text-sm text-muted-foreground">
            {detail.episodeCount} Episodes &middot; {detail.year} &middot;{" "}
            {detail.country === "GH" ? "Ghana" : "Nigeria"}
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-foreground font-medium">
              {"★"} {detail.rating}{" "}
              <span className="text-muted-foreground font-normal">
                ({detail.reviewCount})
              </span>
            </span>
            <span className="text-muted-foreground">
              {detail.watchingNow} watching now
            </span>
          </div>
        </div>

        {/* 4. CTA Button */}
        <div className="px-4 pt-5">
          <button
            onClick={() => onPlay?.(0)}
            className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground font-semibold text-base shadow-[0_4px_24px_rgba(139,92,246,0.4)] transition-transform active:scale-[0.97]"
            aria-label={`Play Episode 1 of ${detail.title} for free`}
          >
            <Play className="w-5 h-5 fill-current" />
            {"Play Episode 1 \u00B7 FREE"}
          </button>
        </div>

        {/* 5. About Section */}
        <div className="flex flex-col gap-2 px-4 pt-6">
          <h2 className="text-lg font-semibold text-foreground">About</h2>
          <p
            className={`text-sm text-muted-foreground leading-relaxed ${
              !expanded ? "line-clamp-3" : ""
            }`}
          >
            {detail.description}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary font-medium self-start"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        </div>

        {/* 6. Trailer Section - 9:16 vertical */}
        <div className="flex flex-col gap-3 px-4 pt-6">
          <h2 className="text-lg font-semibold text-foreground">Trailer</h2>
          <div className="flex justify-center">
            <button
              className="relative w-[200px] rounded-2xl overflow-hidden border border-border/50 group"
              style={{ aspectRatio: "9 / 16" }}
              aria-label="Play trailer"
            >
              <Image
                src={detail.trailerThumbnail}
                alt={`${detail.title} trailer`}
                fill
                className="object-cover group-active:scale-105 transition-transform duration-300"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-black/30" />
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                  <Play className="w-6 h-6 fill-foreground text-foreground ml-0.5" />
                </div>
              </div>
              {/* Duration badge */}
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-[11px] font-medium text-foreground backdrop-blur-sm">
                {detail.trailerDuration}
              </span>
              {/* Bottom gradient with label */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-end px-3 pb-3">
                <span className="text-xs font-medium text-foreground/90">Official Trailer</span>
              </div>
            </button>
          </div>
        </div>

        {/* 7. Episodes Section */}
        <div className="flex flex-col gap-3 px-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Episodes</h2>
            <span className="text-sm text-muted-foreground">
              {detail.episodeCount} episodes
            </span>
          </div>

          {(() => {
            const maxVisible = 5
            const remaining = detail.episodeCount - maxVisible
            const visibleEpisodes = detail.episodes.slice(0, maxVisible)
            const lastEp = detail.episodes[maxVisible] || detail.episodes[detail.episodes.length - 1]

            return (
              <div className="grid grid-cols-2 gap-3">
                {visibleEpisodes.map((ep, i) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    onTap={() => {
                      if (ep.status === "locked") {
                        setPaywallEpisode(ep.number)
                        setPaywallOpen(true)
                      } else {
                        onPlay?.(i)
                      }
                    }}
                  />
                ))}

                {remaining > 0 && (
                  <button
                    className="flex flex-col gap-1.5 text-left group transition-transform active:scale-[0.97]"
                    aria-label={`View all ${detail.episodeCount} episodes`}
                  >
                    <div
                      className="relative w-full rounded-lg overflow-hidden border border-border/50"
                      style={{ aspectRatio: "3 / 4" }}
                    >
                      <Image
                        src={lastEp.image}
                        alt="More episodes"
                        fill
                        className="object-cover blur-sm brightness-[0.35] scale-105"
                        sizes="180px"
                      />
                      {/* Frosted overlay */}
                      <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3">
                        <span className="text-2xl font-bold text-foreground">
                          +{remaining}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
                          more episodes
                        </span>
                        <span className="mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-[10px] font-semibold text-primary-foreground">
                          View All
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Ep {maxVisible + 1} - {detail.episodeCount}
                    </p>
                  </button>
                )}
              </div>
            )
          })()}
        </div>

        {/* 8. More Like This */}
        <div className="flex flex-col gap-3 pt-8">
          <h2 className="text-lg font-semibold text-foreground px-4">
            More Like This
          </h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1">
            {moreLikeThis.map((drama) => (
              <button
                key={drama.id}
                onClick={() => onNavigate?.(drama.id)}
                className="flex-shrink-0 flex flex-col gap-2 group transition-transform active:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                aria-label={`${drama.title} - ${drama.genre}`}
              >
                <div className="relative w-[110px] h-[196px] rounded-lg overflow-hidden border border-border/50">
                  <Image
                    src={drama.image}
                    alt={drama.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="110px"
                  />
                </div>
                <div className="w-[110px] text-left">
                  <p className="text-xs font-medium text-foreground truncate">
                    {drama.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {drama.genre}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Paywall */}
      <SubscriptionPaywall
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        episodeNumber={paywallEpisode}
        dramaTitle={detail.title}
      />
    </div>
  )
}

/* ───────── Episode Card ───────── */

function EpisodeCard({ episode, onTap }: { episode: Episode; onTap?: () => void }) {
  if (episode.status === "locked") return <LockedEpisodeCard episode={episode} onTap={onTap} />
  if (episode.status === "watched") return <WatchedEpisodeCard episode={episode} onTap={onTap} />
  return <FreeEpisodeCard episode={episode} onTap={onTap} />
}

function FreeEpisodeCard({ episode, onTap }: { episode: Episode; onTap?: () => void }) {
  return (
    <button onClick={onTap} className="flex flex-col gap-1.5 text-left group transition-transform active:scale-[0.97]">
      <div
        className="relative w-full rounded-lg overflow-hidden border border-border/50"
        style={{ aspectRatio: "3 / 4" }}
      >
        <Image
          src={episode.image}
          alt={episode.title}
          fill
          className="object-cover"
          sizes="180px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* FREE badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-[10px] font-bold text-foreground">
          FREE
        </span>

        {/* Episode number */}
        <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm bg-black/30 px-1.5 py-0.5 rounded">
          Ep {episode.number}
        </span>

        {/* Duration */}
        <span className="absolute bottom-2 right-2 text-[10px] text-foreground/80 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded">
          {episode.duration}
        </span>
      </div>
      <p className="text-xs font-medium text-foreground truncate">
        {episode.title}
      </p>
    </button>
  )
}

function LockedEpisodeCard({ episode, onTap }: { episode: Episode; onTap?: () => void }) {
  return (
    <button onClick={onTap} className="flex flex-col gap-1.5 text-left">
      <div
        className="relative w-full rounded-lg overflow-hidden border border-border/50"
        style={{ aspectRatio: "3 / 4" }}
      >
        <Image
          src={episode.image}
          alt={episode.title}
          fill
          className="object-cover blur-md brightness-[0.4]"
          sizes="180px"
        />

        {/* Lock icon center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 border border-primary/30">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary">Premium</span>
        </div>

        {/* Episode number */}
        <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-foreground/70 backdrop-blur-sm bg-black/30 px-1.5 py-0.5 rounded">
          Ep {episode.number}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground truncate">
        {episode.title}
      </p>
    </button>
  )
}

function WatchedEpisodeCard({ episode, onTap }: { episode: Episode; onTap?: () => void }) {
  return (
    <button onClick={onTap} className="flex flex-col gap-1.5 text-left group transition-transform active:scale-[0.97]">
      <div
        className="relative w-full rounded-lg overflow-hidden border border-border/50"
        style={{ aspectRatio: "3 / 4" }}
      >
        <Image
          src={episode.image}
          alt={episode.title}
          fill
          className="object-cover"
          sizes="180px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Checkmark */}
        <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500">
          <Check className="w-3.5 h-3.5 text-foreground" />
        </div>

        {/* Episode number */}
        <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-foreground/90 backdrop-blur-sm bg-black/30 px-1.5 py-0.5 rounded">
          Ep {episode.number}
        </span>

        {/* Progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
          <div
            className="h-full bg-primary rounded-r-full"
            style={{ width: `${episode.progress ?? 100}%` }}
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground truncate">
          {episode.title}
        </p>
        {episode.watchedAgo && (
          <p className="text-[10px] text-muted-foreground">
            Watched {episode.watchedAgo}
          </p>
        )}
      </div>
    </button>
  )
}
