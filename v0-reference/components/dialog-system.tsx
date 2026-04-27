"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import {
  AlertTriangle,
  Info,
  FileText,
  X,
  Check,
} from "lucide-react"

// ─── Base Dialog Shell ───

interface DialogShellProps {
  open: boolean
  onClose: () => void
  dismissOnBackdrop?: boolean
  children: ReactNode
}

function DialogShell({
  open,
  onClose,
  dismissOnBackdrop = true,
  children,
}: DialogShellProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [open])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center px-8 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "rgba(10, 10, 10, 0.92)",
        backdropFilter: "blur(8px)",
      }}
      onClick={dismissOnBackdrop ? onClose : undefined}
    >
      <div
        className={`w-full max-w-[320px] bg-card rounded-[20px] border border-border/50 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${
          visible
            ? "animate-[dialog-enter_300ms_ease-out]"
            : "animate-[dialog-exit_200ms_ease-in]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Type 1: Confirmation Dialog ───

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  icon?: ReactNode
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "destructive" | "default"
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  icon,
  title,
  body,
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <DialogShell open={open} onClose={onClose} dismissOnBackdrop={false}>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full ${
            variant === "destructive" ? "bg-amber-500/20" : "bg-primary/20"
          }`}
        >
          {icon || (
            <AlertTriangle
              className={`w-6 h-6 ${
                variant === "destructive"
                  ? "text-amber-500"
                  : "text-primary"
              }`}
            />
          )}
        </div>

        <h3 className="text-xl font-bold text-foreground mt-4">{title}</h3>
        <p className="text-[15px] text-muted-foreground mt-2.5 leading-relaxed">
          {body}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-transparent border-2 border-border text-foreground text-base font-semibold transition-transform active:scale-[0.97]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 h-12 rounded-xl text-white text-base font-bold transition-transform active:scale-[0.97] ${
              variant === "destructive"
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-primary to-[hsl(258,90%,44%)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </DialogShell>
  )
}

// ─── Type 2: Info Dialog ───

interface InfoDialogProps {
  open: boolean
  onClose: () => void
  title: string
  body: string
  buttonLabel?: string
  onButtonClick?: () => void
}

export function InfoDialog({
  open,
  onClose,
  title,
  body,
  buttonLabel = "Got It",
  onButtonClick,
}: InfoDialogProps) {
  return (
    <DialogShell open={open} onClose={onClose} dismissOnBackdrop>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
          <Info className="w-6 h-6 text-primary" />
        </div>

        <h3 className="text-xl font-bold text-foreground mt-4">{title}</h3>
        <p className="text-[15px] text-muted-foreground mt-2.5 leading-relaxed">
          {body}
        </p>

        <button
          onClick={() => {
            onButtonClick?.()
            onClose()
          }}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white text-base font-bold mt-6 transition-transform active:scale-[0.97]"
        >
          {buttonLabel}
        </button>
      </div>
    </DialogShell>
  )
}

// ─── Type 3: Input Dialog ───

interface InputDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (text: string) => void
  title: string
  body: string
  placeholder?: string
  submitLabel?: string
  maxLength?: number
}

export function InputDialog({
  open,
  onClose,
  onSubmit,
  title,
  body,
  placeholder = "Describe the issue...",
  submitLabel = "Submit Report",
  maxLength = 500,
}: InputDialogProps) {
  const [text, setText] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setText("")
      setTimeout(() => ref.current?.focus(), 350)
    }
  }, [open])

  return (
    <DialogShell open={open} onClose={onClose} dismissOnBackdrop={false}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
          <FileText className="w-6 h-6 text-primary" />
        </div>

        <h3 className="text-xl font-bold text-foreground mt-4">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {body}
        </p>

        <div className="w-full mt-5">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) =>
              setText(e.target.value.slice(0, maxLength))
            }
            rows={4}
            placeholder={placeholder}
            className="w-full rounded-xl bg-background border-2 border-border focus:border-primary text-foreground text-sm p-3 resize-none outline-none transition-colors placeholder:text-muted-foreground/40"
          />
          <p className="text-[11px] text-muted-foreground/50 text-right mt-1">
            {text.length} / {maxLength}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full mt-4">
          <button
            onClick={onClose}
            className="w-[40%] h-12 rounded-xl bg-transparent border-2 border-border text-foreground text-[15px] font-semibold transition-transform active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(text)
              onClose()
            }}
            disabled={!text.trim()}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-[hsl(258,90%,44%)] text-white text-[15px] font-bold transition-transform active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </DialogShell>
  )
}

// ─── Type 4: Choice Dialog ───

interface ChoiceOption {
  label: string
  value: string
}

interface ChoiceDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (value: string) => void
  title: string
  options: ChoiceOption[]
  selectedValue?: string
}

export function ChoiceDialog({
  open,
  onClose,
  onSelect,
  title,
  options,
  selectedValue,
}: ChoiceDialogProps) {
  return (
    <DialogShell open={open} onClose={onClose} dismissOnBackdrop>
      {/* Header */}
      <div className="flex items-center justify-between -mt-1 mb-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-foreground/60 transition-transform active:scale-95"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-col -mx-2">
        {options.map((opt) => {
          const isSelected = opt.value === selectedValue
          return (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value)
                onClose()
              }}
              className={`flex items-center justify-between h-14 px-4 rounded-xl transition-colors ${
                isSelected
                  ? "bg-primary/10"
                  : "hover:bg-white/[0.04] active:bg-white/[0.06]"
              }`}
            >
              <span
                className={`text-base ${
                  isSelected
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {opt.label}
              </span>
              {/* Radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </DialogShell>
  )
}
