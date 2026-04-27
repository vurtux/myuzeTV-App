"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Mail,
  Star,
  AlertCircle,
  Copy,
  CheckCircle2,
} from "lucide-react"

/* ───────── Shared Sub-screen Shell ───────── */
function SubScreenShell({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background max-w-[430px] mx-auto flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 border-b border-border/50">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border/50 transition-transform active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

/* ───────── 1. Edit Profile Screen ───────── */
export function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("Sarah Mensah")
  const [email] = useState("sarah@example.com")
  const [bio, setBio] = useState("")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <SubScreenShell title="Edit Profile" onBack={onBack}>
      <div className="flex flex-col gap-6 p-4">
        {/* Avatar with camera */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[hsl(258,90%,44%)] p-[2px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-3xl font-bold text-foreground">SK</span>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background transition-transform active:scale-95">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Tap to change photo</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 px-4 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Email
            </label>
            <div className="h-12 px-4 rounded-xl bg-card border border-border/50 flex items-center">
              <span className="text-[15px] text-muted-foreground">{email}</span>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              Email cannot be changed
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground font-semibold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.35)] transition-transform active:scale-[0.97]"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </SubScreenShell>
  )
}

/* ───────── 2. Language Screen ───────── */
export function LanguageScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState("English")
  const languages = [
    "English",
    "French",
    "Spanish",
    "Portuguese",
    "Twi",
    "Hausa",
    "Yoruba",
    "Swahili",
    "Arabic",
    "Hindi",
  ]

  return (
    <SubScreenShell title="Language" onBack={onBack}>
      <div className="p-4">
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelected(lang)}
              className="flex items-center justify-between w-full px-4 py-4 active:bg-white/[0.03] transition-colors"
            >
              <span
                className={`text-[15px] ${
                  selected === lang
                    ? "text-primary font-medium"
                    : "text-foreground"
                }`}
              >
                {lang}
              </span>
              {selected === lang && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </SubScreenShell>
  )
}

/* ───────── 4. Privacy Policy Screen ───────── */
export function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
  return (
    <SubScreenShell title="Privacy Policy" onBack={onBack}>
      <div className="p-4 pb-24">
        <div className="rounded-2xl bg-card border border-border/50 p-5">
          <p className="text-xs text-muted-foreground mb-3">
            Last updated: February 1, 2026
          </p>
          <div className="flex flex-col gap-5 text-sm text-foreground/80 leading-relaxed">
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                1. Information We Collect
              </h3>
              <p>
                We collect information you provide directly to us, including
                your name, email address, and viewing preferences. We also
                collect usage data such as viewing history, interaction with
                content, and device information.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                2. How We Use Your Information
              </h3>
              <p>
                Your information helps us personalize your experience,
                recommend content, process transactions, and improve our
                services. We never sell your personal data to third parties.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                3. Data Storage & Security
              </h3>
              <p>
                We use industry-standard encryption and security measures to
                protect your data. Your information is stored on secure servers
                and access is restricted to authorized personnel only.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                4. Your Rights
              </h3>
              <p>
                You have the right to access, update, or delete your personal
                data at any time. You can also opt out of promotional
                communications through your notification settings.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                5. Contact
              </h3>
              <p>
                For privacy-related inquiries, contact us at
                privacy@myuze.tv
              </p>
            </section>
          </div>
        </div>
      </div>
    </SubScreenShell>
  )
}

/* ───────── 5. Terms of Service Screen ───────── */
export function TermsOfServiceScreen({ onBack }: { onBack: () => void }) {
  return (
    <SubScreenShell title="Terms of Service" onBack={onBack}>
      <div className="p-4 pb-24">
        <div className="rounded-2xl bg-card border border-border/50 p-5">
          <p className="text-xs text-muted-foreground mb-3">
            Last updated: February 1, 2026
          </p>
          <div className="flex flex-col gap-5 text-sm text-foreground/80 leading-relaxed">
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing or using myuzeTV, you agree to be bound by these
                Terms of Service. If you do not agree, you may not use the
                service.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                2. Subscription & Billing
              </h3>
              <p>
                Premium subscriptions are billed on a recurring basis. You can
                cancel at any time through your app store. Refunds are subject
                to the respective app store policies.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                3. Content & Intellectual Property
              </h3>
              <p>
                All content on myuzeTV is protected by copyright. You may not
                reproduce, distribute, or create derivative works without
                explicit permission.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                4. Account Termination
              </h3>
              <p>
                We reserve the right to suspend or terminate accounts that
                violate these terms. Users may delete their accounts at any
                time from the profile settings.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">
                5. Limitation of Liability
              </h3>
              <p>
                myuzeTV is provided "as is" without warranties. We are not
                liable for any indirect, incidental, or consequential damages
                arising from your use of the service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SubScreenShell>
  )
}

/* ───────── 6. Help Center Screen ───────── */
export function HelpCenterScreen({ onBack }: { onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faqs = [
    {
      q: "How do I unlock premium episodes?",
      a: "You can unlock premium episodes by subscribing to myuzeTV Premium or by purchasing individual episodes with coins. Tap the lock icon on any episode to see unlock options.",
    },
    {
      q: "How do I cancel my subscription?",
      a: "Go to Profile > Manage Subscription, or cancel directly through your App Store / Google Play subscription settings. Your access continues until the end of the billing period.",
    },
    {
      q: "Why is a video not loading?",
      a: "Check your internet connection. If the issue persists, try clearing your cache from Profile > Clear Cache, or reinstall the app. Contact support if problems continue.",
    },
    {
      q: "Can I download episodes for offline viewing?",
      a: "Yes, premium subscribers can download episodes for offline viewing. Tap the download icon on any episode page to save it to your device.",
    },
    {
      q: "How do I change the subtitle language?",
      a: "During playback, tap the screen to show controls, then tap the subtitle icon (CC) to choose your preferred language.",
    },
  ]

  return (
    <SubScreenShell title="Help Center" onBack={onBack}>
      <div className="p-4 pb-24">
        {/* FAQ */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Frequently Asked Questions
          </p>
          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-4 py-4 active:bg-white/[0.03] transition-colors text-left"
                >
                  <span className="text-[15px] text-foreground pr-4">
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 -mt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zoho Desk Ticket Form */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Still need help? Raise a ticket
        </p>
        <ZohoTicketForm />
      </div>
    </SubScreenShell>
  )
}

/* ───────── Zoho Desk Ticket Form ───────── */
function ZohoTicketForm() {
  const [category, setCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [submitted, setSubmitted] = useState(false)

  const categories = [
    "Billing & Subscription",
    "Playback Issues",
    "Account Access",
    "Content Request",
    "Bug Report",
    "Other",
  ]

  const handleSubmit = () => {
    if (!category || !subject.trim() || !description.trim()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--badge-green))]/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-[hsl(var(--badge-green))]" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Ticket Submitted
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">
          Your ticket has been created. You will receive a confirmation email with your ticket ID shortly.
        </p>
        <div className="rounded-xl bg-card border border-border/50 px-4 py-3 mt-1">
          <p className="text-xs text-muted-foreground">Ticket Reference</p>
          <p className="text-sm font-mono font-medium text-foreground mt-0.5">
            #DB-{Math.floor(100000 + Math.random() * 900000)}
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false)
            setCategory("")
            setSubject("")
            setDescription("")
            setPriority("Medium")
          }}
          className="mt-2 text-sm text-primary font-medium transition-opacity active:opacity-70"
        >
          Submit another ticket
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Submit a ticket and our support team will get back to you within 24 hours via email.
          </p>
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/50 text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of your issue"
          className="h-12 px-4 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your issue in detail. Include steps to reproduce if reporting a bug..."
          rows={4}
          className="px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          Priority
        </label>
        <div className="flex gap-2">
          {["Low", "Medium", "High"].map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                priority === p
                  ? p === "High"
                    ? "bg-destructive/20 text-destructive border border-destructive/40"
                    : p === "Medium"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-[hsl(var(--badge-green))]/20 text-[hsl(var(--badge-green))] border border-[hsl(var(--badge-green))]/40"
                  : "bg-card border border-border/50 text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${
          category && subject.trim() && description.trim()
            ? "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
            : "bg-muted text-muted-foreground"
        }`}
      >
        Submit Ticket
      </button>
    </div>
  )
}

/* ───────── 7. Contact Us Screen ───────── */
export function ContactUsScreen({ onBack }: { onBack: () => void }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return
    setSent(true)
  }

  return (
    <SubScreenShell title="Contact Us" onBack={onBack}>
      <div className="p-4 pb-24">
        {sent ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--badge-green))]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[hsl(var(--badge-green))]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Message Sent
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">
              We typically respond within 24 hours. Check your email for
              updates.
            </p>
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2.5 rounded-xl bg-card border border-border/50 text-foreground text-sm font-medium transition-transform active:scale-[0.97]"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Email display */}
            <div className="rounded-2xl bg-card border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    You are writing as
                  </p>
                  <p className="text-sm text-foreground">sarah@example.com</p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What can we help with?"
                className="h-12 px-4 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or feedback..."
                rows={5}
                className="px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Send */}
            <button
              onClick={handleSend}
              className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${
                subject.trim() && message.trim()
                  ? "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Send Message
            </button>

            {/* Alternative */}
            <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Or email us directly
              </p>
              <button
                onClick={() =>
                  navigator.clipboard?.writeText("support@myuze.tv")
                }
                className="flex items-center gap-2 text-sm text-primary font-medium transition-opacity active:opacity-70"
              >
                <Copy className="w-3.5 h-3.5" />
                support@myuze.tv
              </button>
            </div>
          </div>
        )}
      </div>
    </SubScreenShell>
  )
}

/* ───────── 8. Rate App Screen ───────── */
export function RateAppScreen({ onBack }: { onBack: () => void }) {
  const [rating, setRating] = useState(0)
  const [hovering, setHovering] = useState(0)
  const [review, setReview] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <SubScreenShell title="Rate myuzeTV" onBack={onBack}>
      <div className="p-4 pb-24">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="w-8 h-8 text-primary fill-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Thank You!
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">
              Your feedback helps us improve myuzeTV for everyone.
            </p>
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2.5 rounded-xl bg-card border border-border/50 text-foreground text-sm font-medium transition-transform active:scale-[0.97]"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 pt-6">
            <p className="text-[15px] text-foreground text-center">
              How would you rate your experience?
            </p>

            {/* Stars */}
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovering(star)}
                  onMouseLeave={() => setHovering(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hovering || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 5
                  ? "Excellent!"
                  : rating === 4
                    ? "Great!"
                    : rating === 3
                      ? "Good"
                      : rating === 2
                        ? "Could be better"
                        : "We'll do better"}
              </p>
            )}

            {/* Review textarea */}
            {rating > 0 && (
              <div className="w-full flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                  Tell us more (optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What do you love or what can we improve?"
                  rows={4}
                  className="px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground text-[15px] outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/50"
                />
              </div>
            )}

            {rating > 0 && (
              <button
                onClick={() => setSubmitted(true)}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-primary-foreground font-semibold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.35)] transition-transform active:scale-[0.97]"
              >
                Submit Review
              </button>
            )}
          </div>
        )}
      </div>
    </SubScreenShell>
  )
}

/* ───────── 9. Manage Subscription Screen ───────── */
export function ManageSubscriptionScreen({
  onBack,
}: {
  onBack: () => void
}) {
  return (
    <SubScreenShell title="Manage Subscription" onBack={onBack}>
      <div className="p-4 pb-24">
        {/* Current plan */}
        <div className="rounded-2xl border-2 border-primary/40 bg-primary/[0.08] p-5 mb-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                Premium Plan
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-primary/20 text-[11px] font-semibold text-primary tracking-wide">
                ACTIVE
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Billing</span>
                <span className="text-foreground">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span>Price</span>
                <span className="text-foreground">GHS 9.99/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Next renewal</span>
                <span className="text-foreground">March 14, 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Payment method</span>
                <span className="text-foreground">Google Play</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan benefits */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Your Benefits
        </p>
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50 mb-6">
          {[
            "Unlimited episode access",
            "No advertisements",
            "Offline downloads",
            "Early access to new dramas",
            "Exclusive premium content",
          ].map((b) => (
            <div key={b} className="flex items-center gap-3 px-4 py-3.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[15px] text-foreground">{b}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <button className="flex items-center justify-between w-full px-4 py-4 active:bg-white/[0.03] transition-colors">
            <span className="text-[15px] text-foreground">
              Restore Purchase
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </div>

        {/* Cancel */}
        <div className="mt-8 flex flex-col items-center">
          <button className="text-sm text-destructive font-medium transition-opacity active:opacity-70">
            Cancel Subscription
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-[280px]">
            Access continues until March 14, 2026
          </p>
        </div>
      </div>
    </SubScreenShell>
  )
}


