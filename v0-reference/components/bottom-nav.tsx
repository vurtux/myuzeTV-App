"use client"

import { Home, Bookmark, User } from "lucide-react"

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "profile", label: "Me", icon: User },
] as const

export type TabId = (typeof tabs)[number]["id"]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center h-12 px-2 rounded-full border border-white/[0.08] bg-white/[0.06] backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_0.5px_0_rgba(255,255,255,0.06)]"
      aria-label="Main navigation"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeTab
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex items-center gap-1.5 h-8 px-4 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-white/[0.1] text-foreground"
                : "text-white/40 hover:text-white/60"
            }`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            <Icon
              className={`w-[18px] h-[18px] transition-all ${
                isActive ? "stroke-[2.2]" : "stroke-[1.5]"
              }`}
            />
            {isActive && (
              <span className="text-[11px] font-medium tracking-wide">
                {label}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
