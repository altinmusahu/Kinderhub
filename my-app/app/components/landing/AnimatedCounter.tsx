"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  value: string
  label: string
}

export default function AnimatedCounter({ value, label }: Props) {
  const [display, setDisplay] = useState("0")
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const cleaned = value.replace(/,/g, "")
    const match = cleaned.match(/^(\d+)(.*)$/)

    if (!match) {
      setDisplay(value)
      return
    }

    const target = parseInt(match[1], 10)
    const suffix = match[2]
    const duration = 1500
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * target)
      const formatted = current.toLocaleString()
      setDisplay(progress < 1 ? `${formatted}${suffix}` : value)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value])

  return (
    <div>
      <p className="text-xl sm:text-3xl font-extrabold text-indigo-600" aria-label={value}>
        {display}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
