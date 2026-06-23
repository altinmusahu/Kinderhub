"use client"

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

type Props = {
  open: boolean
  onClose: () => void
  title: string
  sub?: string
  icon?: ReactNode
  iconBg?: string
  iconColor?: string
  width?: number
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, sub, icon, iconBg = "#FEF0E8", iconColor = "#B24420", width = 560, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // trap focus inside modal
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(26,23,20,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        style={{
          background: "var(--kh-surface)",
          border: "1px solid var(--kh-border)",
          borderRadius: 18,
          boxShadow: "0 32px 80px -24px rgba(26,23,20,0.45), 0 4px 14px -8px rgba(26,23,20,0.3)",
          display: "flex", flexDirection: "column",
          width: Math.min(width, window.innerWidth - 48),
          maxHeight: "calc(100vh - 48px)",
          overflow: "hidden",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "20px 22px 16px",
          borderBottom: "1px solid var(--kh-border)",
          flexShrink: 0,
        }}>
          {icon && (
            <div style={{
              width: 38, height: 38, minWidth: 38, borderRadius: 11,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: iconBg, color: iconColor, fontSize: 18,
            }}>
              {icon}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, letterSpacing: "-0.01em", color: "var(--kh-ink-900)", lineHeight: 1.05 }}>
              {title}
            </div>
            {sub && <div style={{ fontSize: 12.5, color: "var(--kh-ink-500)", marginTop: 3 }}>{sub}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-border)",
              background: "var(--kh-surface)", color: "var(--kh-ink-400)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 22px",
            borderTop: "1px solid var(--kh-border)",
            background: "var(--kh-ink-50)",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>
              <kbd style={{ padding: "1px 5px", borderRadius: 4, border: "1px solid var(--kh-border)", fontSize: 10 }}>Esc</kbd> to close
            </span>
            <span style={{ flex: 1 }} />
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Reusable form field ────────────────────────────────────────────────────
type FieldProps = {
  label?: string
  required?: boolean
  optional?: boolean
  hint?: string
  colSpan?: 2 | 3
  children: ReactNode
}
export function MField({ label, required, optional, hint, colSpan, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: colSpan ? `span ${colSpan}` : undefined }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--kh-ink-700)", display: "flex", alignItems: "center", gap: 5 }}>
          {label}
          {required && <span style={{ color: "#D2592F" }}>*</span>}
          {optional && <span style={{ color: "var(--kh-ink-300)", fontWeight: 400, fontSize: 11 }}>optional</span>}
        </label>
      )}
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{hint}</span>}
    </div>
  )
}

// ── Section heading ────────────────────────────────────────────────────────
export function MSection({ idx, title, desc, children }: { idx?: string; title: string; desc?: string; children?: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 12 }}>
        {idx && <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 10.5, color: "var(--kh-ink-300)" }}>{idx}</span>}
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" }}>{title}</span>
        {desc && <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginLeft: "auto" }}>{desc}</span>}
      </div>
      {children}
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
export function MInput(props: React.InputHTMLAttributes<HTMLInputElement> & { pre?: string; suf?: string }) {
  const { pre, suf, style, ...rest } = props
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "9px 11px", border: "1px solid var(--kh-border)",
      borderRadius: 9, background: "var(--kh-bg)", fontSize: 13,
      color: "var(--kh-ink-900)", transition: "border-color 120ms",
    }}
      onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#D2592F")}
      onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--kh-border)")}
    >
      {pre && <span style={{ color: "var(--kh-ink-400)", fontSize: 12.5, fontFamily: "var(--kh-font-mono)", flexShrink: 0 }}>{pre}</span>}
      <input {...rest} style={{ border: "none", outline: "none", background: "transparent", font: "inherit", color: "inherit", width: "100%", ...style }} />
      {suf && <span style={{ color: "var(--kh-ink-400)", fontSize: 12.5, fontFamily: "var(--kh-font-mono)", flexShrink: 0 }}>{suf}</span>}
    </div>
  )
}

// ── Select ─────────────────────────────────────────────────────────────────
export function MSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        padding: "9px 11px", border: "1px solid var(--kh-border)",
        borderRadius: 9, background: "var(--kh-bg)", fontSize: 13,
        color: props.value ? "var(--kh-ink-900)" : "var(--kh-ink-400)",
        fontFamily: "inherit", outline: "none", width: "100%",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239E968A' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "calc(100% - 11px) center",
        paddingRight: 32,
        ...props.style,
      }}
    />
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────
export function MToggle({ on, title, desc, onChange }: { on: boolean; title: string; desc?: string; onChange?: (v: boolean) => void }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 13px", border: "1px solid var(--kh-border)",
        borderRadius: 11, background: "var(--kh-bg)", cursor: "pointer",
      }}
      onClick={() => onChange?.(!on)}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{title}</div>
        {desc && <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{
        width: 38, height: 22, borderRadius: 999, flexShrink: 0,
        background: on ? "#7FA06A" : "var(--kh-ink-300)",
        position: "relative", transition: "background 150ms",
      }}>
        <div style={{
          position: "absolute", top: 2, left: on ? 18 : 2,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 150ms",
        }} />
      </div>
    </div>
  )
}

// ── Segmented control ──────────────────────────────────────────────────────
export function MSegmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      padding: 3, gap: 2, background: "var(--kh-ink-50)",
      border: "1px solid var(--kh-border)", borderRadius: 10,
    }}>
      {options.map(o => (
        <button
          key={o} type="button"
          onClick={() => onChange(o)}
          style={{
            padding: "6px 13px", borderRadius: 7, fontSize: 12.5,
            fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: o === value ? "var(--kh-surface)" : "transparent",
            color: o === value ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
            boxShadow: o === value ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 120ms",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

// ── Footer buttons ─────────────────────────────────────────────────────────
export function MBtn({ children, variant = "primary", onClick, type = "button", disabled }: {
  children: ReactNode; variant?: "primary" | "ghost" | "accent" | "danger" | "secondary"
  onClick?: () => void; type?: "button" | "submit"; disabled?: boolean
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: "var(--kh-ink-900)", color: "#fff", borderColor: "var(--kh-ink-900)" },
    accent:    { background: "#D2592F", color: "#fff", borderColor: "#B24420" },
    danger:    { background: "#D97F8C", color: "#fff", borderColor: "#C05060" },
    ghost:     { background: "transparent", color: "var(--kh-ink-600)", borderColor: "transparent" },
    secondary: { background: "var(--kh-surface)", color: "var(--kh-ink-800)", borderColor: "var(--kh-border)" },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "9px 16px", borderRadius: 9, fontSize: 13,
        fontWeight: 500, border: "1px solid transparent",
        fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

// ── 2-column form grid ─────────────────────────────────────────────────────
export function MGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "13px 14px" }}>
      {children}
    </div>
  )
}
