import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { verifyToken, cookieName } from "@/lib/auth"
import { FamiliesService } from "@/app/api/modules/families/families.service"
import type { FamilyWithDetails } from "@/app/api/modules/families/families.types"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import AddFamilyModal from "@/components/ui/AddFamilyModal"

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Active:   { bg: "#E8F5EC", color: "#3A8C50" },
  Waitlist: { bg: "#FEF3E2", color: "#B07A1A" },
  Paused:   { bg: "#F0EDE8", color: "#7A7368" },
}

const AVATAR_COLORS = ["#E8866A","#6BA07C","#C9AE4E","#D97F8C","#6A9EC8","#A07CB4","#7CA0B4"]
function avatarColor(id: string) {
  let n = 0; for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}
function familyInitials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

const columns: Column<FamilyWithDetails>[] = [
  {
    key: "family",
    header: "Family",
    cell: (f) => {
      const ac = avatarColor(f.id)
      return (
        <Link href={`/dashboard/families/${f.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="kh-avatar" style={{ background: ac + "22", color: ac, fontSize: 10, flexShrink: 0 }}>
            {familyInitials(f.name)}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{f.name}</div>
          </div>
        </Link>
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
    cell: (s) => (
      <Link
        href={`/dashboard/families/${s.id}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500,
        }}
      >
        Open →
      </Link>
    ),
  }
]

export default async function FamiliesPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")
  const { tenant_id } = session

  const families = await FamiliesService.getAllWithDetails(tenant_id)

  const activeCount   = families.filter(f => f.status === "Active").length
  const waitlistCount = families.filter(f => f.status === "Waitlist").length
  const pausedCount   = families.filter(f => f.status === "Paused").length
  const balanceDue    = families.filter(f => f.balance > 0).length

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Families</span>
        </nav>
        <div className="kh-topbar-right">
          <AddFamilyModal />
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 6 }}>
          <h1 className="kh-h1">Families</h1>
          <p className="kh-sub">
            {families.length} total · {activeCount} active · {waitlistCount} waitlist · {pausedCount} paused
          </p>
        </div>

        {families.length === 0 ? (
          <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
            No families yet. Add the first one using the button above.
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={families}
            getRowKey={(f) => f.id}
            title="All families"
            meta={`${families.length} families · ${balanceDue} with balance due`}
          />
        )}
      </div>
    </div>
  )
}
