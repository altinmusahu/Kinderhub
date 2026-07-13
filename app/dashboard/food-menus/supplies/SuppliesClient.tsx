"use client"

import { useState } from "react"
import { Camera, Plus } from "lucide-react"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import ExportSuppliesButton from "./ExportSuppliesButton"
import { UploadReceiptModal } from "./UploadReceiptModal"
import { ReceiptViewer } from "./ReceiptViewer"
import { avatarColor, initials } from "@/components/ui/helper"
import type { FoodSupplyWithDetails } from "@/app/api/modules/food_supplies/food_supplies.types"

function fmtMoney(n: number): string {
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function mode(values: (string | null)[]): string | null {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [v, c] of counts) {
    if (c > bestCount) { best = v; bestCount = c }
  }
  return best
}

export function SuppliesClient({ initialSupplies }: { initialSupplies: FoodSupplyWithDetails[] }) {
  const [supplies, setSupplies] = useState(initialSupplies)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewing, setViewing] = useState<FoodSupplyWithDetails | null>(null)

  function handleSaved(supply: FoodSupplyWithDetails) {
    setSupplies(prev => [supply, ...prev])
  }

  const now = new Date()
  const thisMonth = supplies.filter(s => {
    const d = new Date(s.purchase_date + "T00:00:00")
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const loggedThisMonth = thisMonth.reduce((sum, s) => sum + Number(s.total_cost), 0)
  const avgPerReceipt = supplies.length > 0
    ? supplies.reduce((sum, s) => sum + Number(s.total_cost), 0) / supplies.length
    : 0
  const topVendor = mode(supplies.map(s => s.vendor_name))
  const topVendorCount = topVendor ? supplies.filter(s => s.vendor_name === topVendor).length : 0

  const columns: Column<FoodSupplyWithDetails>[] = [
    { key: "date", header: "Date", cellStyle: { fontSize: 12.5, color: "var(--kh-ink-600)", fontFamily: "var(--kh-font-mono)" }, cell: s => fmtDate(s.purchase_date) },
    { key: "vendor", header: "Vendor", cellStyle: { fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" }, cell: s => s.vendor_name || "—" },
    { key: "location", header: "Location", cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" }, cell: s => s.location_name || "—" },
    {
      key: "logged_by", header: "Logged by",
      cell: s => {
        const name = s.created_by_name ?? "Unknown"
        const [first, last] = name.split(" ")
        const ac = avatarColor(s.created_by)
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="kh-avatar" style={{ background: ac + "22", color: ac, fontSize: 9.5, flexShrink: 0 }}>
              {initials(first ?? "", last ?? "")}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--kh-ink-700)" }}>{name}</span>
          </div>
        )
      },
    },
    { key: "items", header: "Items", cellStyle: { fontSize: 12.5, color: "var(--kh-ink-500)", textAlign: "right" }, headerStyle: { textAlign: "right" }, cell: s => s.items_count },
    { key: "total", header: "Total", cellStyle: { fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)", textAlign: "right" }, headerStyle: { textAlign: "right" }, cell: s => fmtMoney(s.total_cost) },
    {
      key: "status", header: "Status",
      cell: () => (
        <span className="kh-status-badge" style={{ background: "#E8F5EC", color: "#3A8C50" }}>
          <span className="kh-pill-dot" style={{ background: "#3A8C50" }} />
          Confirmed
        </span>
      ),
    },
    {
      key: "view", header: "",
      cell: s => s.receipt_url ? (
        <button
          type="button"
          onClick={() => setViewing(s)}
          title="View receipt"
          style={{ background: "none", border: "none", color: "var(--kh-ink-400)", cursor: "pointer", display: "flex" }}
        >
          <Camera size={14} />
        </button>
      ) : (
        <span title="No photo attached" style={{ color: "var(--kh-ink-200)", display: "flex" }}>
          <Camera size={14} />
        </span>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="kh-h1">Food supplies</h1>
          <p className="kh-sub" style={{ margin: "4px 0 0" }}>Receipts logged by chefs &amp; admins — both locations</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <ExportSuppliesButton />
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", background: "var(--kh-peach)", color: "#fff",
            }}
          >
            <Plus size={14} /> Upload receipt
          </button>
        </div>
      </div>

      <div className="kh-kpi-strip" style={{ marginBottom: 16 }}>
        <div className="kh-card" style={{ padding: "13px 16px" }}>
          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Logged this month</div>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.1 }}>{fmtMoney(loggedThisMonth)}</div>
          <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>{thisMonth.length} receipt{thisMonth.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="kh-card" style={{ padding: "13px 16px" }}>
          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Avg. per receipt</div>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.1 }}>{fmtMoney(avgPerReceipt)}</div>
          <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>across both houses</div>
        </div>
        <div className="kh-card" style={{ padding: "13px 16px" }}>
          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Top vendor</div>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.2 }}>{topVendor ?? "—"}</div>
          <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>{topVendorCount} visit{topVendorCount !== 1 ? "s" : ""} this month</div>
        </div>
        <div className="kh-card" style={{ padding: "13px 16px" }}>
          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Awaiting review</div>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.1 }}>0</div>
          <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>all confirmed</div>
        </div>
      </div>

      <div className="kh-card" style={{
        display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", marginBottom: 16,
        background: "var(--kh-sage-bg)", border: "1px solid #CFE3C6",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--kh-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-sage-d)", flexShrink: 0 }}>
          <Camera size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" }}>Just came back from the market?</div>
          <div style={{ fontSize: 12, color: "var(--kh-ink-600)", marginTop: 1 }}>Snap a photo of the receipt — we&apos;ll read the items and total, then you confirm before it saves.</div>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
            padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer", background: "var(--kh-peach)", color: "#fff",
          }}
        >
          <Camera size={13} /> Upload receipt
        </button>
      </div>

      {supplies.length === 0 ? (
        <div className="kh-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--kh-ink-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--kh-ink-400)" }}>
            <Camera size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-700)", marginBottom: 6 }}>No receipts logged yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>Upload your first receipt to start tracking food supply spend.</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={supplies}
          getRowKey={s => s.id}
          title="Receipts"
          meta={`${supplies.length} this month`}
        />
      )}

      {uploadOpen && (
        <UploadReceiptModal onClose={() => setUploadOpen(false)} onSaved={handleSaved} />
      )}
      {viewing && (
        <ReceiptViewer supply={viewing} onClose={() => setViewing(null)} />
      )}
    </>
  )
}
