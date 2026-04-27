"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  RefreshCcw,
  CreditCard,
  Phone,
  MessageCircle,
  Lock,
  X,
  Wifi,
  CalendarX,
  ShieldAlert,
} from "lucide-react"

interface PaymentFailedProps {
  open: boolean
  onClose: () => void
  onRetry: () => void
  onDifferentMethod?: () => void
  onContinueFree?: () => void
}

const commonReasons = [
  { icon: CreditCard, text: "Insufficient funds in account" },
  { icon: ShieldAlert, text: "Card blocked by your bank" },
  { icon: CalendarX, text: "Expired card or incorrect details" },
  { icon: Wifi, text: "Network connection issue" },
]

export function PaymentFailed({
  open,
  onClose,
  onRetry,
  onDifferentMethod,
  onContinueFree,
}: PaymentFailedProps) {
  const [visible, setVisible] = useState(false)
  const [stagger, setStagger] = useState(0)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
      const timers = [1, 2, 3, 4].map((step) =>
        setTimeout(() => setStagger(step), 200 + step * 200)
      )
      return () => timers.forEach(clearTimeout)
    } else {
      setVisible(false)
      setStagger(0)
      setRetrying(false)
    }
  }, [open])

  if (!open) return null

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      setRetrying(false)
      onRetry()
    }, 1500)
  }

  return (
    <div
      className={`fixed inset-0 z-[70] bg-background transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/60 transition-transform active:scale-95"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="h-dvh overflow-y-auto hide-scrollbar px-5 pb-8">
        <div className="flex flex-col items-center pt-16">
          {/* Warning icon */}
          <div
            className="relative transition-all duration-500"
            style={{
              opacity: stagger >= 1 ? 1 : 0,
              transform: stagger >= 1 ? "scale(1)" : "scale(0.8)",
            }}
          >
            <div className="absolute -inset-4 rounded-full bg-amber-500/10" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20">
              <AlertTriangle className="w-9 h-9 text-amber-500" />
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-2xl font-bold text-white text-center mt-6 transition-all duration-700"
            style={{
              opacity: stagger >= 1 ? 1 : 0,
              transform: stagger >= 1 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            Payment Unsuccessful
          </h1>
          <p
            className="text-[15px] text-muted-foreground text-center mt-2 transition-all duration-700"
            style={{
              opacity: stagger >= 1 ? 1 : 0,
              transform: stagger >= 1 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            {"We couldn't process your payment"}
          </p>
          <p
            className="text-sm text-amber-500 font-medium text-center mt-1.5 transition-all duration-500"
            style={{ opacity: stagger >= 1 ? 1 : 0 }}
          >
            Card declined by bank
          </p>

          {/* What happened card */}
          <div
            className="w-full mt-7 rounded-2xl bg-card border border-border/50 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-700"
            style={{
              opacity: stagger >= 2 ? 1 : 0,
              transform: stagger >= 2 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-base font-semibold text-foreground">
                What happened?
              </span>
            </div>
            <InfoRow label="Amount" value="GH&#x20B5; 9.99" />
            <InfoRow label="Plan" value="Premium Monthly" />
            <InfoRow label="Payment" value="**** 4242" />
            <InfoRow
              label="Error Code"
              value="ERR_CARD_DECLINED"
              valueClass="text-amber-500 font-mono text-[12px]"
            />
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-muted-foreground">Time</span>
              <span className="text-[15px] text-foreground">
                Feb 14, 2:45 PM
              </span>
            </div>
          </div>

          {/* Common reasons */}
          <div
            className="w-full mt-6 transition-all duration-700"
            style={{
              opacity: stagger >= 2 ? 1 : 0,
              transform: stagger >= 2 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <h3 className="text-base font-semibold text-foreground mb-3 px-1">
              Common Reasons
            </h3>
            <div className="flex flex-col">
              {commonReasons.map((r, i) => {
                const Icon = r.icon
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <Icon className="w-5 h-5 text-muted-foreground/60 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {r.text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div
            className="w-full mt-7 flex flex-col gap-3 transition-all duration-700"
            style={{
              opacity: stagger >= 3 ? 1 : 0,
              transform: stagger >= 3 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white text-base font-bold shadow-[0_4px_24px_rgba(139,92,246,0.4)] transition-transform active:scale-[0.97] disabled:opacity-70"
            >
              {retrying ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-5 h-5" />
                  Try Again
                </>
              )}
            </button>

            <button
              onClick={onDifferentMethod}
              className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-transparent border-2 border-border text-foreground text-[15px] font-semibold transition-transform active:scale-[0.97]"
            >
              <CreditCard className="w-5 h-5" />
              Use Different Payment Method
            </button>

            <button className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-transparent border-2 border-border text-foreground text-[15px] font-semibold transition-transform active:scale-[0.97]">
              <Phone className="w-5 h-5" />
              Contact My Bank
            </button>
          </div>

          {/* Help box */}
          <div
            className="w-full mt-6 rounded-2xl bg-card border border-border/50 border-l-4 border-l-amber-500 p-4 transition-all duration-700"
            style={{
              opacity: stagger >= 4 ? 1 : 0,
              transform: stagger >= 4 ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">
                  Need Help?
                </p>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Our support team is here to help you complete your
                  subscription.
                </p>
                <button className="text-primary text-sm font-semibold mt-2 transition-opacity active:opacity-70">
                  {"Chat with Support \u2192"}
                </button>
              </div>
            </div>
          </div>

          {/* Continue free */}
          <div
            className="flex flex-col items-center gap-2 mt-7 pb-4"
            style={{
              opacity: stagger >= 4 ? 0.7 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            <p className="text-sm text-muted-foreground/60">
              Not ready to subscribe?
            </p>
            <button
              onClick={onContinueFree}
              className="text-sm text-primary/70 underline underline-offset-2 transition-opacity active:opacity-70"
            >
              Continue with Free Plan
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 mt-6 pb-6 opacity-40">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              Your data is secure and encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <>
      <div className="flex items-center justify-between py-3">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <span
          className={
            valueClass || "text-[15px] font-semibold text-foreground"
          }
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
      <div className="h-px bg-border/30" />
    </>
  )
}
