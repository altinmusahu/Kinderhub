type SpinnerSize = "sm" | "md" | "lg"

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: "kh-loader--sm",
  md: "kh-loader--md",
  lg: "",
}

/** From Uiverse.io by SchawnnahJ. Sizes: sm (~18px, inline in buttons/rows), md (~30px), lg (default, 40px). */
export function Spinner({ size = "md", className = "" }: { size?: SpinnerSize; className?: string }) {
  return <div className={`kh-loader ${SIZE_CLASS[size]} ${className}`.trim()} role="status" aria-label="Loading" />
}

/** Full-bleed overlay spinner — absolutely covers its relatively-positioned parent. */
export function SpinnerOverlay({ size = "lg" }: { size?: SpinnerSize }) {
  return (
    <div className="kh-loader--overlay">
      <Spinner size={size} />
    </div>
  )
}
