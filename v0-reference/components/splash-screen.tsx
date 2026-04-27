"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0)
  // phase 0 = bg fade in
  // phase 1 = logo scale in + glow
  // phase 2 = tagline + subtitle
  // phase 3 = progress bar
  // phase 4 = fade out

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => onComplete(), 3400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400"
      style={{
        opacity: phase === 0 ? 0 : phase === 4 ? 0 : 1,
        background:
          "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139,92,246,0.08) 0%, transparent 70%), linear-gradient(180deg, #1A0B2E 0%, #0A0A0A 40%, #0A0A0A 60%, #2D1B4E 100%)",
      }}
    >
      {/* Centered purple glow */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px] transition-opacity duration-1000"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: phase >= 1 ? 0.25 : 0,
        }}
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Logo image with animation */}
        <div
          className="relative transition-all duration-[1200ms]"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1
              ? "scale(1) translateY(0)"
              : "scale(0.5) translateY(20px)",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: phase >= 1
              ? "drop-shadow(0 8px 32px rgba(139,92,246,0.5))"
              : "drop-shadow(0 0 0 transparent)",
          }}
        >
          <Image
            src="/images/myuzetv-logo.png"
            alt="myuzeTV"
            width={260}
            height={130}
            className="object-contain"
            priority
          />
        </div>

        {/* Subtitle */}
        <p
          className="text-base font-light tracking-[4px] uppercase transition-all duration-500"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
            color: "#A0A0A0",
          }}
        >
          Watch. Binge. Repeat.
        </p>

        {/* Tagline */}
        <p
          className="text-sm text-center transition-all duration-500 delay-100"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
            color: "#A0A0A0",
          }}
        >
          {"Africa's #1 Short Drama Platform"}
        </p>

        {/* Progress Bar */}
        <div
          className="relative w-[200px] h-1 rounded-full overflow-hidden mt-2 transition-opacity duration-300"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: phase >= 3 ? "100%" : "0%",
              transition: "width 1.5s ease-out",
              background: "linear-gradient(90deg, #8B5CF6, #7C3AED)",
            }}
          />
        </div>
      </div>

      {/* Version text */}
      <p
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] transition-opacity duration-500"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          color: "#666",
        }}
      >
        Version 1.0.0
      </p>
    </div>
  )
}
