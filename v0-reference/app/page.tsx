"use client"

import { useState, useCallback } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { LoginScreen } from "@/components/login-screen"
import { HeroUnit } from "@/components/hero-unit"
import { ContinueWatchingRail } from "@/components/continue-watching-rail"
import { DramaRail } from "@/components/drama-rail"
import { BottomNav, type TabId } from "@/components/bottom-nav"
import { TopBar } from "@/components/top-bar"
import { SearchOverlay } from "@/components/search-overlay"
import { DramaDetail } from "@/components/drama-detail"
import { VerticalPlayer } from "@/components/vertical-player"
import { WatchlistScreen } from "@/components/watchlist-screen"
import { ProfileScreen } from "@/components/profile-screen"
import {
  trendingNow,
  newThisWeek,
  romanceDramas,
  fantasyDramas,
} from "@/lib/drama-data"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [showLogin, setShowLogin] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDrama, setActiveDrama] = useState<string | null>(null)
  const [playerOpen, setPlayerOpen] = useState<{
    dramaId: string
    episodeIndex: number
  } | null>(null)

  const handleSplashComplete = useCallback(() => setShowSplash(false), [])

  const handleDramaTap = (id: string) => {
    setActiveDrama(id)
  }

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Login screen
  if (showLogin) {
    return (
      <LoginScreen
        onLogin={() => setShowLogin(false)}
        onGuest={() => setShowLogin(false)}
      />
    )
  }

  // Detail screen (overlays on any tab)
  if (activeDrama) {
    return (
      <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
        <DramaDetail
          dramaId={activeDrama}
          onBack={() => setActiveDrama(null)}
          onNavigate={(id) => {
            setActiveDrama(id)
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          onPlay={(episodeIndex) =>
            setPlayerOpen({ dramaId: activeDrama, episodeIndex })
          }
        />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        {playerOpen && (
          <VerticalPlayer
            dramaId={playerOpen.dramaId}
            startEpisodeIndex={playerOpen.episodeIndex}
            onClose={() => setPlayerOpen(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      {/* ───── Home Tab ───── */}
      {activeTab === "home" && (
        <>
          <TopBar onSearchOpen={() => setSearchOpen(true)} />
          <main className="flex flex-col pb-24">
            <HeroUnit onDramaTap={handleDramaTap} />
            <div className="flex flex-col gap-6 pt-5">
              <ContinueWatchingRail onDramaTap={handleDramaTap} />
              <DramaRail
                title="Trending Now"
                dramas={trendingNow}
                variant="trending"
                onDramaTap={handleDramaTap}
              />
              <DramaRail
                title="New This Week"
                dramas={newThisWeek}
                variant="new"
                onDramaTap={handleDramaTap}
              />
              <DramaRail
                title="Romance"
                dramas={romanceDramas}
                onDramaTap={handleDramaTap}
              />
              <DramaRail
                title="Fantasy"
                dramas={fantasyDramas}
                onDramaTap={handleDramaTap}
              />
            </div>
          </main>
        </>
      )}

      {/* ───── Watchlist Tab ───── */}
      {activeTab === "watchlist" && (
        <WatchlistScreen onDramaTap={handleDramaTap} />
      )}

      {/* ───── Profile Tab ───── */}
      {activeTab === "profile" && <ProfileScreen />}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Search Overlay */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onDramaTap={(id) => {
          setSearchOpen(false)
          handleDramaTap(id)
        }}
      />
    </div>
  )
}
