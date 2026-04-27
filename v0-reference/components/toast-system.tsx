"use client"

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import { Check, X, Info, AlertTriangle, Loader2 } from "lucide-react"

// ─── Toast types ───

type ToastType = "success" | "error" | "info" | "warning" | "loading"

interface Toast {
  id: string
  type: ToastType
  message: string
  submessage?: string
  actionLabel?: string
  onAction?: () => void
  progress?: number
  duration?: number
}

interface ToastCtx {
  show: (toast: Omit<Toast, "id">) => string
  dismiss: (id: string) => void
  update: (id: string, partial: Partial<Toast>) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be inside ToastProvider")
  return ctx
}

// ─── Provider ───

let toastSeq = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastSeq}`
      setToasts((prev) => {
        const next = [...prev, { ...toast, id }]
        return next.length > 3 ? next.slice(-3) : next
      })
      if (toast.type !== "loading") {
        const ms = toast.duration ?? (toast.actionLabel ? 5000 : 3000)
        setTimeout(() => dismiss(id), ms)
      }
      return id
    },
    [dismiss]
  )

  const update = useCallback((id: string, partial: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    )
  }, [])

  return (
    <ToastContext.Provider value={{ show, dismiss, update }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Container ───

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 inset-x-0 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ─── Single toast item ───

const config: Record<
  ToastType,
  { bg: string; icon: typeof Check }
> = {
  success: { bg: "bg-emerald-600/95", icon: Check },
  error: { bg: "bg-red-500/95", icon: X },
  info: { bg: "bg-primary/95", icon: Info },
  warning: { bg: "bg-amber-500/95", icon: AlertTriangle },
  loading: { bg: "bg-card/95 border border-border/50", icon: Loader2 },
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const { bg, icon: Icon } = config[toast.type]

  const handleDismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 200)
  }, [onDismiss, toast.id])

  return (
    <div
      className={`pointer-events-auto w-full max-w-[400px] rounded-xl ${bg} backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${
        exiting ? "animate-[toast-exit_200ms_ease-in_forwards]" : "animate-[toast-enter_300ms_ease-out]"
      }`}
      style={{
        transform: swipeX ? `translateX(${swipeX}px)` : undefined,
        opacity: swipeX ? 1 - Math.abs(swipeX) / 200 : undefined,
      }}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchMove={(e) => {
        if (touchStart === null) return
        setSwipeX(e.touches[0].clientX - touchStart)
      }}
      onTouchEnd={() => {
        if (Math.abs(swipeX) > 100) handleDismiss()
        else setSwipeX(0)
        setTouchStart(null)
      }}
      onClick={() => {
        if (!toast.actionLabel) handleDismiss()
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
            toast.type === "loading" ? "bg-white/10" : "bg-white/20"
          }`}
        >
          <Icon
            className={`w-4 h-4 text-white ${
              toast.type === "loading" ? "animate-spin" : ""
            }`}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-white leading-snug truncate">
            {toast.message}
          </p>
          {toast.submessage && (
            <p className="text-[13px] text-white/70 mt-0.5 truncate">
              {toast.submessage}
            </p>
          )}
          {/* Progress bar for loading */}
          {toast.type === "loading" && toast.progress !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] transition-[width] duration-300 ease-out"
                  style={{ width: `${toast.progress}%` }}
                />
              </div>
              <span className="text-[11px] text-white/60 font-mono">
                {toast.progress}%
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        {toast.actionLabel && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toast.onAction?.()
              handleDismiss()
            }}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-transform active:scale-95 ${
              toast.type === "warning"
                ? "bg-white/20"
                : "underline underline-offset-2"
            }`}
          >
            {toast.actionLabel}
          </button>
        )}

        {/* Cancel for loading */}
        {toast.type === "loading" && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            className="shrink-0 text-[13px] text-white/70 font-medium transition-opacity active:opacity-70"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Demo panel to preview all toasts ───

export function ToastDemo() {
  const toast = useToast()

  const showSuccess = () =>
    toast.show({
      type: "success",
      message: "Added to Watchlist",
      submessage: "You can watch it later",
      actionLabel: "View",
      onAction: () => {},
    })

  const showError = () =>
    toast.show({
      type: "error",
      message: "Payment Failed",
      submessage: "Please try again",
      actionLabel: "Retry",
      onAction: () => {},
    })

  const showInfo = () =>
    toast.show({
      type: "info",
      message: "Quality set to 720p",
    })

  const showWarning = () =>
    toast.show({
      type: "warning",
      message: "Free trial ends in 2 days",
      submessage: "Subscribe to continue watching",
      actionLabel: "Subscribe",
      onAction: () => {},
    })

  const showLoading = () => {
    const id = toast.show({
      type: "loading",
      message: "Downloading Episode 12...",
      progress: 0,
    })
    let p = 0
    const iv = setInterval(() => {
      p += 5
      if (p >= 100) {
        clearInterval(iv)
        toast.dismiss(id)
        toast.show({ type: "success", message: "Download complete" })
        return
      }
      toast.update(id, { progress: p })
    }, 200)
  }

  return (
    <div className="flex flex-wrap gap-2 p-4">
      <DemoBtn label="Success" onClick={showSuccess} />
      <DemoBtn label="Error" onClick={showError} />
      <DemoBtn label="Info" onClick={showInfo} />
      <DemoBtn label="Warning" onClick={showWarning} />
      <DemoBtn label="Loading" onClick={showLoading} />
    </div>
  )
}

function DemoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground font-medium transition-transform active:scale-95"
    >
      {label}
    </button>
  )
}
