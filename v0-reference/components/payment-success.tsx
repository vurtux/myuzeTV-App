"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Check,
  Copy,
  Film,
  Zap,
  ShieldOff,
  Smartphone,
  X,
  ExternalLink,
} from "lucide-react"

interface PaymentSuccessProps {
  open: boolean
  onClose: () => void
  onStartWatching: () => void
  showImage?: string
}

const confettiColors = ["#8B5CF6", "#EC4899", "#FFFFFF", "#A78BFA", "#F9A8D4"]

function ConfettiParticle({ color, delay }: { color: string; delay: number }) {
  const left = Math.random() * 100
  const size = 4 + Math.random() * 6
  const duration = 3 + Math.random() * 2

  return (
    <div
      className="absolute rounded-sm"
      style={{
        left: `${left}%`,
        top: -10,
        width: size,
        height: size * (0.5 + Math.random()),
        backgroundColor: color,
        opacity: 0.8,
        animation: `confetti-fall ${duration}s linear ${delay}s infinite`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  )
}

const benefits = [
  { icon: Film, title: "All Episodes", text: "Watch unlimited" },
  { icon: Zap, title: "New Releases", text: "Early access" },
  { icon: ShieldOff, title: "Ad-Free", text: "No interruptions" },
  { icon: Smartphone, title: "Multi-Device", text: "3 devices" },
]

export function PaymentSuccess({
  open,
  onClose,
  onStartWatching,
  showImage = "/images/hero-love-in-accra.jpg",
}: PaymentSuccessProps) {
  const [visible, setVisible] = useState(false)
  const [checkDone, setCheckDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [stagger, setStagger] = useState(0)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
      setTimeout(() => setCheckDone(true), 600)
      const timers = [1, 2, 3, 4, 5].map((step) =>
        setTimeout(() => setStagger(step), 300 + step * 200)
      )
      return () => timers.forEach(clearTimeout)
    } else {
      setVisible(false)
      setCheckDone(false)
      setStagger(0)
      setCopied(false)
    }
  }, [open])

  if (!open) return null

  const txnId = "TXN-2026-02-14-8472"

  const handleCopy = () => {
    navigator.clipboard.writeText(txnId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`fixed inset-0 z-[70] bg-background transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 24 }, (_, i) => (
          <ConfettiParticle
            key={i}
            color={confettiColors[i % confettiColors.length]}
            delay={Math.random() * 2}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/80 transition-transform active:scale-95"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Scrollable content */}
      <div className="relative h-dvh overflow-y-auto hide-scrollbar">
        {/* Top poster image - square aspect, edge to edge */}
        <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
          <Image
            src={showImage}
            alt="Show"
            fill
            className="object-cover"
            sizes="430px"
            priority
          />
          {/* Heavy gradient fade from image into background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.3) 50%, hsl(220 10% 8%) 90%)",
            }}
          />

          {/* Success badge overlaid on image */}
          <div className="absolute bottom-0 inset-x-0 flex flex-col items-center translate-y-1/3 z-10">
            <div
              style={{
                transform: checkDone ? "scale(1)" : "scale(0)",
                transition:
                  "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-primary/25 animate-paywall-glow" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(330,80%,55%)] shadow-[0_8px_32px_rgba(139,92,246,0.5)] border-4 border-background">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content below the image */}
        <div className="relative z-10 px-5 pt-12 pb-8">
          {/* Headline */}
          <div
            className="flex flex-col items-center transition-all duration-700"
            style={{
              opacity: stagger >= 1 ? 1 : 0,
              transform: stagger >= 1 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <h1 className="text-2xl font-bold text-foreground text-center text-balance">
              Welcome to Premium!
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1.5">
              Your subscription is now active
            </p>
          </div>

          {/* Subscription details card */}
          <div
            className="mt-6 rounded-2xl bg-card border border-border/50 p-4 transition-all duration-700"
            style={{
              opacity: stagger >= 2 ? 1 : 0,
              transform: stagger >= 2 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <DetailRow label="Plan" value="Premium Monthly" />
            <DetailRow label="Amount" value="GH&#x20B5; 9.99" />
            <DetailRow label="Next Billing" value="March 14, 2026" />
            <DetailRow label="Free Trial" value="7 days" last={false} />
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-muted-foreground">
                Transaction
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-mono text-foreground/80"
              >
                {txnId}
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground/50" />
                )}
              </button>
            </div>
          </div>

          {/* Benefits - compact */}
          <div
            className="mt-6 transition-all duration-700"
            style={{
              opacity: stagger >= 3 ? 1 : 0,
              transform: stagger >= 3 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <div className="grid grid-cols-4 gap-2">
              {benefits.map((b, i) => {
                const Icon = b.icon
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border/50 transition-all duration-500"
                    style={{
                      opacity: stagger >= 3 ? 1 : 0,
                      transform:
                        stagger >= 3 ? "scale(1)" : "scale(0.9)",
                      transitionDelay: `${i * 80}ms`,
                    }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
                      {b.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-8 flex flex-col items-center gap-3 transition-all duration-700"
            style={{
              opacity: stagger >= 4 ? 1 : 0,
              transform: stagger >= 4 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <button
              onClick={onStartWatching}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white text-base font-bold shadow-[0_4px_24px_rgba(139,92,246,0.4)] transition-transform active:scale-[0.97]"
            >
              Start Watching Now
            </button>
            <button className="flex items-center gap-1.5 text-primary text-[13px] font-medium transition-opacity active:opacity-70">
              <ExternalLink className="w-3.5 h-3.5" />
              Download Receipt
            </button>
          </div>

          {/* Footer */}
          <div
            className="flex flex-col items-center gap-1 mt-6 pb-4 transition-all duration-500"
            style={{ opacity: stagger >= 5 ? 0.6 : 0 }}
          >
            <p className="text-[11px] text-muted-foreground/60 text-center">
              Need help? Contact support
            </p>
            <button className="text-[11px] text-primary/60 underline underline-offset-2">
              support@myuze.tv
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  last = true,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <>
      <div className="flex items-center justify-between py-2.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[13px] font-semibold text-foreground">
          {value}
        </span>
      </div>
      {last !== false && <div className="h-px bg-border/30" />}
    </>
  )
}
