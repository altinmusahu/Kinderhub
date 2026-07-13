"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import type { FoodSupplyWithDetails, FoodSupplyWithItems } from "@/app/api/modules/food_supplies/food_supplies.types"

function fmtMoney(n: number): string {
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ReceiptViewer({ supply, onClose }: { supply: FoodSupplyWithDetails; onClose: () => void }) {
  const [detail, setDetail] = useState<FoodSupplyWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/food-supplies/${supply.id}`)
      .then(r => r.json())
      .then(d => setDetail(d))
      .finally(() => setLoading(false))
  }, [supply.id])

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="kh-modal-dialog" style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 640, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "90dvh" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 19, color: "var(--kh-ink-900)" }}>{supply.vendor_name || "Receipt"}</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{supply.location_name} · {supply.purchase_date}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="kh-receipt-viewer-body" style={{ overflowY: "auto", padding: 20, display: "flex", gap: 18, flexWrap: "wrap" }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {supply.receipt_url && (
                <div style={{ width: 200, maxWidth: "100%", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={supply.receipt_url} alt="Receipt" style={{ width: "100%", borderRadius: 10, border: "1px solid var(--kh-ink-100)" }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 240 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "4px 0", fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase" }}>Item</th>
                      <th style={{ textAlign: "right", padding: "4px 0", fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase" }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "4px 0", fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail?.items ?? []).map(item => (
                      <tr key={item.id} style={{ borderTop: "1px solid var(--kh-ink-50)" }}>
                        <td style={{ padding: "6px 0", color: "var(--kh-ink-800)" }}>{item.item_name}</td>
                        <td style={{ padding: "6px 0", textAlign: "right", color: "var(--kh-ink-500)" }}>{item.quantity ?? "—"} {item.unit ?? ""}</td>
                        <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600, color: "var(--kh-ink-900)" }}>{fmtMoney(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--kh-ink-100)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" }}>Total</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--kh-ink-900)" }}>{fmtMoney(supply.total_cost)}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 6 }}>Logged by {supply.created_by_name ?? "Unknown"}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
