"use client"

import Image from "next/image"
import { Search, Bell } from "lucide-react"

interface TopBarProps {
  onSearchOpen: () => void
}

export function TopBar({ onSearchOpen }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 bg-background/80 backdrop-blur-lg">
      {/* Logo / Brand */}
      <Image
        src="/images/myuzetv-logo.png"
        alt="myuzeTV"
        width={100}
        height={32}
        className="object-contain"
        priority
      />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSearchOpen}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-card"
          aria-label="Search dramas"
        >
          <Search className="w-[18px] h-[18px] text-foreground" />
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-card relative"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  )
}
