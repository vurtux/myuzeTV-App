"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { ArrowLeft, Smartphone } from "lucide-react"

const LOGO_SRC = "/images/myuzetv-logo.png"

/* ── All poster images for the wall ── */
const POSTERS = [
  "/images/hero-love-in-accra.jpg",
  "/images/drama-ceo-secret.jpg",
  "/images/drama-broken-vows.jpg",
  "/images/drama-market-queen.jpg",
  "/images/drama-midnight-call.jpg",
  "/images/drama-palace-wife.jpg",
  "/images/drama-street-heart.jpg",
  "/images/drama-juju-rising.jpg",
  "/images/drama-gold-coast.jpg",
  "/images/drama-spirit-realm.jpg",
  "/images/drama-sisters-war.jpg",
  "/images/drama-last-born.jpg",
  "/images/drama-enchanted.jpg",
]

interface LoginScreenProps {
  onLogin: () => void
  onGuest: () => void
}

export function LoginScreen({ onLogin, onGuest }: LoginScreenProps) {
  const [step, setStep] = useState<"main" | "phone" | "otp">("main")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+233")
  const [countryFlag, setCountryFlag] = useState("\u{1F1EC}\u{1F1ED}")
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(60)
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null)
  const [otpError, setOtpError] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [stagger, setStagger] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStagger(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (step !== "otp") return
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000)
    return () => clearInterval(interval)
  }, [step, resendTimer])

  const formattedPhone = phone.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3")
  const isPhoneValid = phone.replace(/\D/g, "").length >= 9

  const handlePhoneInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10)
    setPhone(digits)
  }

  const handleSendCode = () => {
    setLoadingBtn("send")
    setTimeout(() => {
      setLoadingBtn(null)
      setResendTimer(60)
      setOtp(["", "", "", "", "", ""])
      setOtpError(false)
      setStep("otp")
    }, 1200)
  }

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    setOtpError(false)
    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
    if (val && index === 5) {
      const code = newOtp.join("")
      if (code.length === 6) handleVerify(code)
    }
  }

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleVerify = (code?: string) => {
    const c = code || otp.join("")
    if (c.length < 6) return
    setLoadingBtn("verify")
    setTimeout(() => {
      setLoadingBtn(null)
      onLogin()
    }, 1500)
  }

  const handleSocialLogin = (provider: string) => {
    setLoadingBtn(provider)
    setTimeout(() => {
      setLoadingBtn(null)
      onLogin()
    }, 1500)
  }

  const handleResend = () => {
    setResendTimer(60)
    setOtp(["", "", "", "", "", ""])
    setOtpError(false)
  }

  const countries = [
    { flag: "\u{1F1EC}\u{1F1ED}", code: "+233", name: "Ghana" },
    { flag: "\u{1F1F3}\u{1F1EC}", code: "+234", name: "Nigeria" },
    { flag: "\u{1F1F0}\u{1F1EA}", code: "+254", name: "Kenya" },
    { flag: "\u{1F1FF}\u{1F1E6}", code: "+27", name: "South Africa" },
    { flag: "\u{1F1F9}\u{1F1FF}", code: "+255", name: "Tanzania" },
    { flag: "\u{1F1FA}\u{1F1EC}", code: "+256", name: "Uganda" },
    { flag: "\u{1F1EA}\u{1F1F9}", code: "+251", name: "Ethiopia" },
    { flag: "\u{1F1E8}\u{1F1F2}", code: "+237", name: "Cameroon" },
    { flag: "\u{1F1E8}\u{1F1EE}", code: "+225", name: "Ivory Coast" },
    { flag: "\u{1F1F8}\u{1F1F3}", code: "+221", name: "Senegal" },
    { flag: "\u{1F1FA}\u{1F1F8}", code: "+1", name: "United States" },
    { flag: "\u{1F1EC}\u{1F1E7}", code: "+44", name: "United Kingdom" },
  ]

  /* ──────── STEP: OTP ENTRY ──────── */
  if (step === "otp") {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col max-w-[430px] mx-auto bg-background"
      >
        <div className="flex items-center px-4 pt-14 pb-4">
          <button
            onClick={() => setStep("phone")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border/50 text-foreground transition-transform active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground pr-10">
            Enter Code
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center px-8 pt-8">
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code sent to
          </p>
          <p className="text-base font-semibold text-foreground mt-1">
            {countryCode} {formattedPhone || phone}
          </p>
          <button
            onClick={() => setStep("phone")}
            className="text-sm text-primary font-medium mt-1 transition-opacity active:opacity-70"
          >
            Change
          </button>

          <div className="flex gap-2 mt-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                className={`w-12 h-14 rounded-xl text-center text-xl font-bold text-foreground outline-none transition-all duration-200 ${
                  otpError
                    ? "bg-card border-2 border-destructive animate-[shake_0.3s_ease-in-out]"
                    : digit
                      ? "bg-card border-2 border-primary"
                      : "bg-card border-2 border-border focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,92,246,0.2)]"
                }`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-xs text-destructive mt-3">
              Invalid code. Please try again.
            </p>
          )}

          <div className="mt-6">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in{" "}
                <span className="text-foreground font-medium">
                  0:{resendTimer.toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-primary font-medium transition-opacity active:opacity-70"
              >
                {"Didn't receive code? Resend"}
              </button>
            )}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={otp.join("").length < 6 || loadingBtn === "verify"}
            className={`flex items-center justify-center gap-2 w-full h-14 rounded-xl font-semibold text-base mt-8 transition-all active:scale-[0.98] ${
              otp.join("").length === 6 && loadingBtn !== "verify"
                ? "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {loadingBtn === "verify" ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>
      </div>
    )
  }

  /* ──────── STEP: PHONE NUMBER (expanded) ──────── */
  if (step === "phone") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col max-w-[430px] mx-auto bg-background">
        <div className="flex items-center px-4 pt-14 pb-4">
          <button
            onClick={() => setStep("main")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border/50 text-foreground transition-transform active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground pr-10">
            Enter Phone Number
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center px-8 pt-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>

          <p className="text-sm text-muted-foreground text-center mb-8">
            {"We'll send you a verification code"}
          </p>

          <div className="flex w-full h-16 rounded-xl bg-card border-2 border-border focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.2)] transition-all overflow-hidden">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1.5 px-3 shrink-0 border-r border-border transition-colors active:bg-white/[0.03]"
            >
              <span className="text-2xl">{countryFlag}</span>
              <span className="text-sm font-medium text-foreground">{countryCode}</span>
              <svg
                className={`w-3 h-3 text-muted-foreground transition-transform ${showPicker ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => handlePhoneInput(e.target.value)}
              placeholder="24 123 4567"
              className="flex-1 px-3 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>

          {showPicker && (
            <div className="w-full mt-2 rounded-xl bg-card border border-border overflow-hidden max-h-[200px] overflow-y-auto hide-scrollbar">
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountryCode(c.code)
                    setCountryFlag(c.flag)
                    setShowPicker(false)
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors active:bg-white/[0.03] ${
                    countryCode === c.code ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-sm text-foreground flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.code}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSendCode}
            disabled={!isPhoneValid || loadingBtn === "send"}
            className={`flex items-center justify-center gap-2 w-full h-14 rounded-xl font-semibold text-base mt-6 transition-all active:scale-[0.98] ${
              isPhoneValid && loadingBtn !== "send"
                ? "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {loadingBtn === "send" ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Send Code"
            )}
          </button>
        </div>
      </div>
    )
  }

  /* ──────── STEP: MAIN LOGIN ──────── */
  return <MainLoginScreen stagger={stagger} phone={phone} countryCode={countryCode} countryFlag={countryFlag} showPicker={showPicker} isPhoneValid={isPhoneValid} loadingBtn={loadingBtn} countries={countries} onPhoneInput={handlePhoneInput} onCountryChange={(flag, code) => { setCountryFlag(flag); setCountryCode(code) }} onTogglePicker={() => setShowPicker(p => !p)} onClosePicker={() => setShowPicker(false)} onSendCode={handleSendCode} onSocialLogin={handleSocialLogin} onGuest={onGuest} />
}

/* ───────── Animated Poster Wall Background ───────── */
function PosterWall() {
  // Build 5 columns, each with duplicated posters for seamless looping
  const columns = useMemo(() => {
    const shuffled = [...POSTERS].sort(() => Math.random() - 0.5)
    const cols: string[][] = [[], [], [], [], []]
    shuffled.forEach((p, i) => cols[i % 5].push(p))
    // Duplicate for seamless loop
    return cols.map((col) => [...col, ...col, ...col])
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Poster columns */}
      <div
        className="flex gap-1.5 h-full"
        style={{ transform: "rotate(-8deg) scale(1.3)", transformOrigin: "center center" }}
      >
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex-1 overflow-hidden">
            <div
              className={colIndex % 2 === 0 ? "animate-poster-up" : "animate-poster-down"}
              style={{
                animationDuration: `${25 + colIndex * 5}s`,
              }}
            >
              <div className="flex flex-col gap-1.5">
                {col.map((poster, i) => (
                  <div
                    key={`${colIndex}-${i}`}
                    className="relative w-full rounded-lg overflow-hidden"
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    <Image
                      src={poster}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      <div className="absolute inset-0 bg-background/40" />
    </div>
  )
}

/* ───────── Main Login Screen ───────── */
function MainLoginScreen({
  stagger,
  phone,
  countryCode,
  countryFlag,
  showPicker,
  isPhoneValid,
  loadingBtn,
  countries,
  onPhoneInput,
  onCountryChange,
  onTogglePicker,
  onClosePicker,
  onSendCode,
  onSocialLogin,
  onGuest,
}: {
  stagger: boolean
  phone: string
  countryCode: string
  countryFlag: string
  showPicker: boolean
  isPhoneValid: boolean
  loadingBtn: string | null
  countries: { flag: string; code: string; name: string }[]
  onPhoneInput: (val: string) => void
  onCountryChange: (flag: string, code: string) => void
  onTogglePicker: () => void
  onClosePicker: () => void
  onSendCode: () => void
  onSocialLogin: (provider: string) => void
  onGuest: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col max-w-[430px] mx-auto overflow-hidden">
      {/* Animated poster wall */}
      <PosterWall />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top spacer + logo */}
        <div className="flex flex-col items-center pt-20 px-8">
          {/* Logo */}
          <div
            className="transition-all duration-[900ms]"
            style={{
              opacity: stagger ? 1 : 0,
              transform: stagger ? "scale(1) translateY(0)" : "scale(0.6) translateY(16px)",
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: stagger
                ? "drop-shadow(0 6px 24px rgba(139,92,246,0.4))"
                : "drop-shadow(0 0 0 transparent)",
            }}
          >
            <Image
              src={LOGO_SRC}
              alt="myuzeTV"
              width={200}
              height={100}
              className="object-contain"
              priority
            />
          </div>
          <p
            className="text-sm text-muted-foreground/80 mt-2 text-center transition-all duration-700 delay-200"
            style={{
              opacity: stagger ? 1 : 0,
              transform: stagger ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Watch. Binge. Fall in Love.
          </p>
        </div>

        {/* Bottom section: phone input + socials */}
        <div className="mt-auto px-6 pb-8 flex flex-col items-center">
          {/* Phone input block */}
          <div
            className="w-full transition-all duration-700 delay-300"
            style={{
              opacity: stagger ? 1 : 0,
              transform: stagger ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <p className="text-[15px] font-semibold text-foreground">
              Sign in to start watching
            </p>
            <p className="text-[13px] text-muted-foreground/70 mt-1 mb-5">
              {"We'll send a verification code to your phone"}
            </p>

            <div className="flex w-full h-14 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all overflow-hidden">
              <button
                onClick={onTogglePicker}
                className="flex items-center gap-1.5 px-3 shrink-0 border-r border-border/50 transition-colors active:bg-white/[0.03]"
              >
                <span className="text-xl">{countryFlag}</span>
                <span className="text-sm font-medium text-foreground">{countryCode}</span>
                <svg
                  className={`w-3 h-3 text-muted-foreground transition-transform ${showPicker ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => onPhoneInput(e.target.value)}
                placeholder="Enter phone number"
                className="flex-1 px-3 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Country picker dropdown */}
            {showPicker && (
              <div className="w-full mt-2 rounded-xl bg-card/90 backdrop-blur-xl border border-border/50 overflow-hidden max-h-[180px] overflow-y-auto hide-scrollbar">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCountryChange(c.flag, c.code)
                      onClosePicker()
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors active:bg-white/[0.03] ${
                      countryCode === c.code ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="text-sm text-foreground flex-1">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.code}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Send Code CTA */}
            <button
              onClick={onSendCode}
              disabled={!isPhoneValid || loadingBtn === "send"}
              className={`flex items-center justify-center gap-2 w-full h-14 rounded-2xl font-semibold text-base mt-3 transition-all active:scale-[0.98] ${
                isPhoneValid && loadingBtn !== "send"
                  ? "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
                  : "bg-muted/60 backdrop-blur-sm text-muted-foreground"
              }`}
            >
              {loadingBtn === "send" ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                "Continue"
              )}
            </button>
          </div>

          {/* Divider */}
          <div
            className="flex items-center gap-3 w-full mt-5 mb-4 transition-all duration-500 delay-[400ms]"
            style={{ opacity: stagger ? 1 : 0 }}
          >
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>

          {/* Social icons row */}
          <div
            className="flex items-center justify-center gap-4 transition-all duration-500 delay-500"
            style={{
              opacity: stagger ? 1 : 0,
              transform: stagger ? "translateY(0)" : "translateY(12px)",
            }}
          >
            {/* Google */}
            <button
              onClick={() => onSocialLogin("google")}
              disabled={!!loadingBtn}
              className="flex items-center justify-center w-14 h-12 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 transition-all active:scale-95"
              aria-label="Continue with Google"
            >
              {loadingBtn === "google" ? (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
            </button>

            {/* Facebook */}
            <button
              onClick={() => onSocialLogin("facebook")}
              disabled={!!loadingBtn}
              className="flex items-center justify-center w-14 h-12 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 transition-all active:scale-95"
              aria-label="Continue with Facebook"
            >
              {loadingBtn === "facebook" ? (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
            </button>

            {/* Apple */}
            <button
              onClick={() => onSocialLogin("apple")}
              disabled={!!loadingBtn}
              className="flex items-center justify-center w-14 h-12 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 transition-all active:scale-95"
              aria-label="Continue with Apple"
            >
              {loadingBtn === "apple" ? (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
            </button>
          </div>

          {/* Guest + Footer */}
          <div
            className="flex flex-col items-center gap-3 mt-5"
            style={{
              opacity: stagger ? 1 : 0,
              transition: "opacity 0.5s ease",
              transitionDelay: "0.6s",
            }}
          >
            <button
              onClick={onGuest}
              className="text-[13px] text-muted-foreground/70 font-medium transition-opacity active:opacity-70"
            >
              {"Skip for now"}
            </button>

            <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed">
              {"By continuing, you agree to our "}
              <button className="text-primary/60 underline underline-offset-2">Terms</button>
              {" & "}
              <button className="text-primary/60 underline underline-offset-2">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
