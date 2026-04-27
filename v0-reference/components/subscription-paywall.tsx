"use client"

import { useState, useEffect } from "react"
import {
  X,
  Check,
  Sparkles,
  Smartphone,
  ShieldOff,
  Lock,
} from "lucide-react"
import { PaymentSuccess } from "@/components/payment-success"

interface SubscriptionPaywallProps {
  open: boolean
  onClose: () => void
  episodeNumber?: number
  dramaTitle?: string
}

const benefits = [
  { icon: Check, text: "Watch all 60 episodes" },
  { icon: Sparkles, text: "New episodes every week" },
  { icon: Smartphone, text: "Watch on 3 devices" },
  { icon: ShieldOff, text: "100% ad-free streaming" },
]

export function SubscriptionPaywall({
  open,
  onClose,
  episodeNumber,
}: SubscriptionPaywallProps) {
  const [visible, setVisible] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [benefitsVisible, setBenefitsVisible] = useState<boolean[]>(
    new Array(benefits.length).fill(false)
  )
  const [promoTimer, setPromoTimer] = useState({ h: 23, m: 45, s: 12 })

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
      benefits.forEach((_, i) => {
        setTimeout(() => {
          setBenefitsVisible((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
        }, 300 + i * 100)
      })
    } else {
      setVisible(false)
      setBenefitsVisible(new Array(benefits.length).fill(false))
      setShowSuccess(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      setPromoTimer((prev) => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) return { h: 23, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [open])

  if (!open) return null

  const pad = (n: number) => n.toString().padStart(2, "0")

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "rgba(10, 10, 10, 0.96)", backdropFilter: "blur(10px)" }}
    >
      {/* Full-screen flex layout: content + anchored CTA */}
      <div className="flex flex-col h-dvh">

        {/* ── Top bar: timer + close ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/90">
            <span className="text-[10px] text-white font-bold tracking-wide">
              {pad(promoTimer.h)}:{pad(promoTimer.m)}:{pad(promoTimer.s)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/60"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Main content: fits viewport, only T&C scrolls ── */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5">
          <div className="flex flex-col items-center">

            {/* Lock icon */}
            <div className="relative flex items-center justify-center w-16 h-16 mt-2">
              <div className="absolute inset-0 rounded-full bg-primary/15 animate-paywall-glow" />
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(258,90%,44%)]">
                <Lock className="w-5 h-5 text-white animate-paywall-unlock" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-white text-center mt-3 text-balance leading-tight">
              Unlock All Episodes
            </h2>

            {/* Emotional hook */}
            <p className="text-[13px] text-[#9A9A9A] text-center mt-1.5 leading-relaxed italic">
              {episodeNumber
                ? `30 seconds from the biggest twist in Ep ${episodeNumber}...`
                : "30 seconds from the biggest twist..."}
            </p>

            {/* Benefits */}
            <div className="flex flex-col gap-2.5 mt-5 w-full">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      benefitsVisible[i]
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-3"
                    }`}
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-white text-sm font-medium">{benefit.text}</span>
                  </div>
                )
              })}
            </div>

            {/* Pricing card */}
            <div className="flex flex-col items-center mt-5 w-full py-4 px-4 rounded-2xl border border-border/50 bg-card/60">
              {/* Social proof */}
              <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[hsl(15,90%,50%)] to-destructive mb-2">
                <span className="text-[10px] font-bold text-white">15K+ members this week</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-[#777] text-base line-through">{"GH\u20B5 18.99"}</span>
                <span className="text-white text-3xl font-bold">{"GH\u20B5 9.99"}</span>
                <span className="text-[#777] text-xs">/mo</span>
              </div>

              {/* Savings */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white">
                  SAVE 47%
                </span>
                <span className="text-[#777] text-[11px] italic">Less than 1 coffee/week</span>
              </div>
            </div>

            {/* T&C and fine print -- this is the scrollable overflow area */}
            <div className="flex flex-col items-center gap-3 mt-4 pb-4">
              <button className="text-primary text-[13px] font-medium underline underline-offset-2">
                See all plans
              </button>
              <button className="text-[#777] text-[11px]">
                Already subscribed? Restore purchase
              </button>
              <div className="text-[#555] text-[10px] text-center leading-relaxed mt-1 max-w-[280px]">
                <p>
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                  Your subscription will auto-renew at GH{"₵"}9.99/month after the 7-day
                  free trial unless cancelled at least 24 hours before the end of the trial period.
                  You can manage your subscription in account settings.
                </p>
                <p className="mt-2">
                  Charges will be applied to your payment method on file. Subscription fees are non-refundable
                  except where required by law. Content availability may vary by region. All prices are in
                  Ghana Cedis (GHS) and include applicable taxes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Anchored CTA bar ── */}
        <div className="shrink-0 px-5 pb-6 pt-3" style={{ background: "linear-gradient(to top, rgba(10,10,10,1) 60%, rgba(10,10,10,0))" }}>
          <button
            onClick={() => setShowSuccess(true)}
            className="w-full h-[52px] rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white text-base font-bold shadow-[0_4px_24px_rgba(139,92,246,0.5)] transition-transform active:scale-[0.98] animate-paywall-cta"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-[#777] text-[11px] text-center mt-2">
            {"Cancel anytime \u2022 No commitment \u2022 Then GH\u20B5 9.99/mo"}
          </p>
        </div>

      </div>

      {/* Payment Success */}
      <PaymentSuccess
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          onClose()
        }}
        onStartWatching={() => {
          setShowSuccess(false)
          onClose()
        }}
      />
    </div>
  )
}
