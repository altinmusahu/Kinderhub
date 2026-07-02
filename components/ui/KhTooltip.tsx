"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { HelpCircle } from "lucide-react"

type Props = {
  children: ReactNode
  label?: string
  side?: "top" | "bottom"
}

export function KhTooltip({ children, label = "More info", side = "top" }: Props) {
  const [open, setOpen] = useState(false)
  const [align, setAlign] = useState<"left" | "center" | "right">("center")
  const wrapRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  // basic viewport collision handling — flip alignment if the bubble would clip
  useEffect(() => {
    if (!open || !wrapRef.current || !bubbleRef.current) return
    const wrap = wrapRef.current.getBoundingClientRect()
    const bubble = bubbleRef.current.getBoundingClientRect()
    const half = bubble.width / 2
    if (wrap.left + wrap.width / 2 - half < 8) setAlign("left")
    else if (wrap.left + wrap.width / 2 + half > window.innerWidth - 8) setAlign("right")
    else setAlign("center")
  }, [open])

  return (
    <span
      ref={wrapRef}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 16, height: 16, padding: 0, marginLeft: 5,
          border: "none", background: "transparent", color: "var(--kh-ink-400)",
          cursor: "pointer", borderRadius: "50%", flexShrink: 0,
        }}
      >
        <HelpCircle size={14} strokeWidth={2} />
      </button>

      {open && (
        <div
          ref={bubbleRef}
          role="tooltip"
          style={{
            position: "absolute",
            ...(side === "top" ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }),
            ...(align === "left" ? { left: 0 } : align === "right" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
            zIndex: 1000,
            width: "max-content",
            maxWidth: 240,
            padding: "8px 10px",
            background: "var(--kh-surface)",
            border: "1px solid var(--kh-border)",
            borderRadius: "var(--kh-radius-sm)",
            boxShadow: "var(--kh-shadow-sm)",
            color: "var(--kh-ink-900)",
            fontFamily: "var(--kh-font-sans)",
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          {children}
        </div>
      )}
    </span>
  )
}
