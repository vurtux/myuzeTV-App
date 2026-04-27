"use client"

import { useState, useEffect, useRef } from "react"
import {
  Globe,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  Star,
  Smartphone,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { SubscriptionPaywall } from "@/components/subscription-paywall"
import {
  EditProfileScreen,
  LanguageScreen,
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
  HelpCenterScreen,
  ContactUsScreen,
  RateAppScreen,
  ManageSubscriptionScreen,
} from "@/components/profile-sub-screens"

/* ───────── Stats counter hook ───────── */
function useCountUp(end: number, duration = 800) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration])

  return value
}

/* ───────── Menu Item ───────── */
function MenuItem({
  icon: Icon,
  label,
  value,
  showChevron = true,
  danger = false,
  center = false,
  onClick,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  showChevron?: boolean
  danger?: boolean
  center?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full h-14 px-4 transition-all active:scale-[0.98] active:bg-white/[0.04] ${
        center ? "justify-center" : "justify-between"
      }`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            className={`w-5 h-5 ${
              danger ? "text-destructive" : "text-muted-foreground"
            }`}
          />
        )}
        <span
          className={`text-[15px] ${
            danger
              ? "text-destructive font-medium"
              : "text-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      {!center && (
        <div className="flex items-center gap-2">
          {value && (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
          {showChevron && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          )}
        </div>
      )}
    </button>
  )
}

/* ───────── Sub-screen type ───────── */
type SubScreen =
  | "edit-profile"
  | "manage-subscription"
  | "language"
  | "privacy"
  | "terms"
  | "help"
  | "contact"
  | "rate"
  | null

/* ───────── Profile Screen ───────── */
export function ProfileScreen() {
  const [isPremium] = useState(true)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen>(null)

  const watchlist = useCountUp(24)
  const watched = useCountUp(142)
  const watchTime = useCountUp(89)

  // Render active sub-screen
  if (activeSubScreen) {
    const onBack = () => setActiveSubScreen(null)
    switch (activeSubScreen) {
      case "edit-profile":
        return <EditProfileScreen onBack={onBack} />
      case "manage-subscription":
        return <ManageSubscriptionScreen onBack={onBack} />
      case "language":
        return <LanguageScreen onBack={onBack} />
      case "privacy":
        return <PrivacyPolicyScreen onBack={onBack} />
      case "terms":
        return <TermsOfServiceScreen onBack={onBack} />
      case "help":
        return <HelpCenterScreen onBack={onBack} />
      case "contact":
        return <ContactUsScreen onBack={onBack} />
      case "rate":
        return <RateAppScreen onBack={onBack} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* 1. Header / Avatar */}
      <div className="flex flex-col items-center pt-14 pb-6 px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[hsl(258,90%,44%)] p-[2px]">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">SK</span>
            </div>
          </div>
          {isPremium && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-semibold text-foreground mt-4">
          Sarah Mensah
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          sarah@example.com
        </p>
        <button
          onClick={() => setActiveSubScreen("edit-profile")}
          className="text-sm text-primary font-medium mt-2 transition-opacity active:opacity-70"
        >
          Edit Profile
        </button>
      </div>

      {/* 2. Subscription Card */}
      <div className="px-4">
        {isPremium ? (
          <div className="relative rounded-2xl border-2 border-primary/40 bg-primary/[0.08] p-5 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="flex items-start justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Premium Active
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Renews on March 14, 2026
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary/20 text-[11px] font-semibold text-primary tracking-wide">
                PREMIUM
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Subscribed via Google Play
            </p>
            <button
              onClick={() => setActiveSubScreen("manage-subscription")}
              className="text-sm text-foreground underline underline-offset-2 mt-3 transition-opacity active:opacity-70"
            >
              Manage Subscription
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-border p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Unlock Premium
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Watch all episodes, ad-free
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground tracking-wide">
                FREE
              </span>
            </div>
            <button
              onClick={() => setPaywallOpen(true)}
              className="flex items-center justify-center w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground font-semibold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.35)] transition-transform active:scale-[0.97]"
            >
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      {/* 3. Stats Row */}
      <div className="px-4 mt-4">
        <div className="flex rounded-2xl bg-card border border-border/50 overflow-hidden">
          {[
            { value: watchlist, label: "Watchlist" },
            { value: watched, label: "Watched" },
            { value: watchTime, label: "Watch Time", suffix: "h" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 flex flex-col items-center py-4 ${
                i < 2 ? "border-r border-border/50" : ""
              }`}
            >
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {stat.value}
                {stat.suffix || ""}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Menu Sections */}
      <div className="mt-6">
        {/* Account */}
        <div className="px-4 mb-1">
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-1">
            Account
          </p>
        </div>
        <div className="mx-4 rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
          <MenuItem
            icon={Globe}
            label="Language"
            value="English"
            onClick={() => setActiveSubScreen("language")}
          />
          <MenuItem
            icon={Shield}
            label="Privacy Policy"
            onClick={() => setActiveSubScreen("privacy")}
          />
          <MenuItem
            icon={FileText}
            label="Terms of Service"
            onClick={() => setActiveSubScreen("terms")}
          />
        </div>

        {/* Support */}
        <div className="px-4 mt-6 mb-1">
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-1">
            Support
          </p>
        </div>
        <div className="mx-4 rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
          <MenuItem
            icon={HelpCircle}
            label="Help Center"
            onClick={() => setActiveSubScreen("help")}
          />
          <MenuItem
            icon={Mail}
            label="Contact Us"
            onClick={() => setActiveSubScreen("contact")}
          />
          <MenuItem
            icon={Star}
            label="Rate App"
            onClick={() => setActiveSubScreen("rate")}
          />
        </div>

        {/* App */}
        <div className="px-4 mt-6 mb-1">
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-1">
            App
          </p>
        </div>
        <div className="mx-4 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <MenuItem
            icon={Smartphone}
            label="App Version"
            value="1.0.0"
            showChevron={false}
          />
        </div>

        {/* Danger Zone */}
        <div className="mt-8 mb-4 flex flex-col items-center gap-3 px-4">
          <button
            onClick={() => setLogoutConfirm(true)}
            className="flex items-center gap-2 text-destructive font-medium text-[15px] transition-opacity active:opacity-70"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-destructive/60 text-sm transition-opacity active:opacity-70"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Logout Confirmation */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[430px] bg-card border-t border-border rounded-t-3xl p-6 pb-8">
            <h3 className="text-lg font-semibold text-foreground text-center">
              Log out?
            </h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              You can always log back in to access your watchlist and progress.
            </p>
            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="w-full h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm transition-transform active:scale-[0.97]"
              >
                Log Out
              </button>
              <button
                onClick={() => setLogoutConfirm(false)}
                className="w-full h-12 rounded-xl bg-muted text-foreground font-medium text-sm transition-transform active:scale-[0.97]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[430px] bg-card border-t border-border rounded-t-3xl p-6 pb-8">
            <h3 className="text-lg font-semibold text-destructive text-center">
              Delete Account?
            </h3>
            <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
              This action is permanent. All your data, watchlist, and viewing
              history will be deleted and cannot be recovered.
            </p>
            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="w-full h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm transition-transform active:scale-[0.97]"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="w-full h-12 rounded-xl bg-muted text-foreground font-medium text-sm transition-transform active:scale-[0.97]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Paywall */}
      <SubscriptionPaywall
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  )
}
