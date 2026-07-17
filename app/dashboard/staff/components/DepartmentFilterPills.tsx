"use client"

export function DepartmentFilterPills({
  departments, active, onChange,
}: {
  departments: { name: string; count: number }[]
  active: string | null
  onChange: (name: string | null) => void
}) {
  const total = departments.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="kh-pills-row" style={{ flexWrap: "wrap" }}>
      <button
        className="kh-pill"
        onClick={() => onChange(null)}
        style={{
          border: `1px solid ${active === null ? "var(--kh-peach)" : "var(--kh-border)"}`,
          background: active === null ? "var(--kh-peach-bg)" : "var(--kh-surface)",
          color: active === null ? "var(--kh-peach-d)" : "var(--kh-ink-600)",
          cursor: "pointer",
        }}
      >
        All {total}
      </button>
      {departments.map((d) => {
        const isActive = active === d.name
        return (
          <button
            key={d.name}
            className="kh-pill"
            onClick={() => onChange(isActive ? null : d.name)}
            style={{
              border: `1px solid ${isActive ? "var(--kh-peach)" : "var(--kh-border)"}`,
              background: isActive ? "var(--kh-peach-bg)" : "var(--kh-surface)",
              color: isActive ? "var(--kh-peach-d)" : "var(--kh-ink-600)",
              cursor: "pointer",
            }}
          >
            {d.name} {d.count}
          </button>
        )
      })}
    </div>
  )
}
