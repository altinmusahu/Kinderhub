"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import type { FamilyWithDetails } from "@/app/api/modules/families/families.types"

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Active:   { bg: "#E8F5EC", color: "#3A8C50" },
  Waitlist: { bg: "#FEF3E2", color: "#B07A1A" },
  Paused:   { bg: "#F0EDE8", color: "#7A7368" },
}

const AVATAR_COLORS = ["#E8866A", "#6BA07C", "#C9AE4E", "#D97F8C", "#6A9EC8", "#A07CB4", "#7CA0B4"]
function avatarColor(id: string) {
  let n = 0; for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}
function familyInitials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

type FilterKey = "all" | "Active" | "Waitlist" | "Paused" | "balance_due" | "custody_missing"

function buildColumns(canDrillDown: boolean): Column<FamilyWithDetails>[] {
  return [
    {
      key: "family",
      header: "Family",
      cell: (f) => {
        const ac = avatarColor(f.id)
        const inner = (
          <>
            <span className="kh-avatar" style={{ background: ac + "22", color: ac, fontSize: 10, flexShrink: 0 }}>
              {familyInitials(f.name)}
            </span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{f.name}</span>
                {f.needs_custody_file && (
                  <span
                    title="A guardian has legal custody but hasn't uploaded proof yet"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      fontSize: 10.5, fontWeight: 600, padding: "1px 6px", borderRadius: 99,
                      background: "#FDF0E3", color: "#B0631A", border: "1px solid #F0C48A",
                    }}
                  >
                    ⚠ Custody file
                  </span>
                )}
              </div>
              {f.primary_contact && (
                <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{f.primary_contact}</div>
              )}
            </div>
          </>
        )
        return canDrillDown ? (
          <Link href={`/dashboard/families/${f.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            {inner}
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{inner}</div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (f) => {
        const sc = STATUS_COLORS[f.status] ?? STATUS_COLORS.Active
        return (
          <span className="kh-status-badge" style={{ background: sc.bg, color: sc.color }}>
            <span className="kh-pill-dot" style={{ background: sc.color }} />
            {f.status}
          </span>
        )
      },
    },
    {
      key: "plan",
      header: "Plan",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-600)" },
      cell: (f) => f.plan || "—",
    },
    {
      key: "kids",
      header: "Kids",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-700)", fontFamily: "var(--kh-font-mono)" },
      cell: (f) => f.kids_count,
    },
    {
      key: "balance",
      header: "Balance",
      headerStyle: { textAlign: "right" },
      cellStyle: (f) => ({
        textAlign: "right",
        fontFamily: "var(--kh-font-mono)",
        fontSize: 13,
        color: f.balance > 0 ? "#C0392B" : "var(--kh-ink-700)",
        fontWeight: f.balance > 0 ? 600 : 400,
      }),
      cell: (f) => `$${Number(f.balance).toFixed(2)}`,
    },
    {
      key: "since",
      header: "Since",
      cellStyle: { fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" },
      cell: (f) => new Date(f.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
    },
    {
      key: "actions",
      header: "",
      cell: (f) => (
        <Link
          href={`/dashboard/families/${f.id}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500,
          }}
        >
          Open →
        </Link>
      ),
    },
  ]
}

export function FamiliesTable({
  families,
  canDrillDown,
}: {
  families: FamilyWithDetails[]
  canDrillDown: boolean
}) {
  const [filter, setFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")

  const counts = useMemo(() => ({
    all: families.length,
    Active: families.filter((f) => f.status === "Active").length,
    Waitlist: families.filter((f) => f.status === "Waitlist").length,
    Paused: families.filter((f) => f.status === "Paused").length,
    balance_due: families.filter((f) => f.balance > 0).length,
    custody_missing: families.filter((f) => f.needs_custody_file).length,
  }), [families])

  const filtered = useMemo(() => {
    return families.filter((f) => {
      if (filter === "Active" && f.status !== "Active") return false
      if (filter === "Waitlist" && f.status !== "Waitlist") return false
      if (filter === "Paused" && f.status !== "Paused") return false
      if (filter === "balance_due" && !(f.balance > 0)) return false
      if (filter === "custody_missing" && !f.needs_custody_file) return false
      if (search) {
        const q = search.toLowerCase()
        const haystack = `${f.name} ${f.primary_contact ?? ""}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [families, filter, search])

  const columns = useMemo(() => buildColumns(canDrillDown), [canDrillDown])

  const pills: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Active", label: "Active" },
    { key: "Waitlist", label: "Waitlist" },
    { key: "Paused", label: "Paused" },
    { key: "balance_due", label: "Balance due" },
    { key: "custody_missing", label: "⚠ Custody file" },
  ]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="kh-pills-row" style={{ flexWrap: "wrap" }}>
          {pills.map((p) => {
            const isActive = filter === p.key
            return (
              <button
                key={p.key}
                className="kh-pill"
                onClick={() => setFilter(p.key)}
                style={{
                  border: `1px solid ${isActive ? "var(--kh-peach)" : "var(--kh-border)"}`,
                  background: isActive ? "var(--kh-peach-bg)" : "var(--kh-surface)",
                  color: isActive ? "var(--kh-peach-d)" : "var(--kh-ink-600)",
                  cursor: "pointer",
                }}
              >
                {p.label} {counts[p.key]}
              </button>
            )
          })}
        </div>
        <input
          placeholder="Search families, parents, kids…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px", border: "1px solid var(--kh-border)", borderRadius: 8,
            background: "var(--kh-ink-50)", fontSize: 13, color: "var(--kh-ink-800)",
            fontFamily: "inherit", outline: "none", minWidth: 240,
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
          No families match these filters.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(f) => f.id}
          title="All families"
          meta={`${filtered.length} of ${families.length} families`}
        />
      )}
    </div>
  )
}
