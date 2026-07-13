"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Plus, Trash2, X, Check, AlertTriangle, Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import type { FoodSupplyWithDetails } from "@/app/api/modules/food_supplies/food_supplies.types"
import type { ParsedReceipt } from "@/app/api/modules/food_supplies/food_supplies.parser"

type LocationOption = { id: string; name: string }

type ItemRow = {
  item_name: string
  quantity: string
  unit: string
  unit_cost: string
  line_total: string
  confidence: "high" | "low" | null // null = manually entered, never scanned
}

const EMPTY_ROW: ItemRow = { item_name: "", quantity: "", unit: "", unit_cost: "", line_total: "", confidence: null }

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
  padding: "8px 10px", fontSize: 13, background: "var(--kh-paper)",
  color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
}

const cellInputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid transparent", borderRadius: 6,
  padding: "5px 6px", fontSize: 12.5, background: "transparent",
  color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
}

function num(v: string): number | null {
  const n = Number(v)
  return v.trim() !== "" && !Number.isNaN(n) ? n : null
}

export function UploadReceiptModal({
  onClose, onSaved,
}: {
  onClose: () => void
  onSaved: (supply: FoodSupplyWithDetails) => void
}) {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split("T")[0])
  const [locationId, setLocationId] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ROW }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/locations")
      .then(r => r.json())
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!file) { setPhotoPreview(null); return }
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function scanReceipt(f: File) {
    setScanning(true)
    setScanError("")
    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch("/api/food-supplies/parse", { method: "POST", body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Could not read this receipt automatically.")
      }
      const parsed: ParsedReceipt = await res.json()

      if (parsed.vendor_name) setVendorName(parsed.vendor_name)
      if (parsed.purchase_date) setPurchaseDate(parsed.purchase_date)
      if (parsed.total_cost !== null) setTotalCost(String(parsed.total_cost))
      if (parsed.items.length > 0) {
        setItems(parsed.items.map(item => ({
          item_name: item.item_name,
          quantity: item.quantity !== null ? String(item.quantity) : "",
          unit: item.unit ?? "",
          unit_cost: item.unit_cost !== null ? String(item.unit_cost) : "",
          line_total: String(item.line_total),
          confidence: item.confidence,
        })))
      }
    } catch (err) {
      // Scanning is best-effort — fall back to empty manual entry, never block the upload flow.
      setScanError(err instanceof Error ? err.message : "Could not read this receipt automatically. Please enter the details manually.")
    } finally {
      setScanning(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      scanReceipt(f)
    }
  }

  function updateRow(index: number, patch: Partial<ItemRow>) {
    setItems(prev => prev.map((row, i) => {
      if (i !== index) return row
      const next = { ...row, ...patch, confidence: null } // editing a row clears its scanned-confidence flag
      const q = num(next.quantity)
      const uc = num(next.unit_cost)
      if (("quantity" in patch || "unit_cost" in patch) && q !== null && uc !== null) {
        next.line_total = (q * uc).toFixed(2)
      }
      return next
    }))
  }

  function removeRow(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function addRow() {
    setItems(prev => [...prev, { ...EMPTY_ROW }])
  }

  const itemsSum = items.reduce((sum, row) => sum + (num(row.line_total) ?? 0), 0)
  const receiptTotal = num(totalCost)
  const mismatch = receiptTotal !== null && Math.abs(itemsSum - receiptTotal) > 0.01

  const readyToSave = !scanning && !!purchaseDate && !!locationId && receiptTotal !== null && receiptTotal > 0
    && items.some(r => r.item_name.trim() !== "")

  async function handleSave() {
    if (!readyToSave) return
    setSaving(true)
    setError("")
    try {
      const cleanItems = items
        .filter(r => r.item_name.trim() !== "")
        .map(r => ({
          item_name: r.item_name.trim(),
          quantity: num(r.quantity),
          unit: r.unit.trim() || null,
          unit_cost: num(r.unit_cost),
          line_total: num(r.line_total) ?? 0,
        }))

      const fd = new FormData()
      if (file) fd.append("file", file)
      fd.append("vendor_name", vendorName.trim())
      fd.append("purchase_date", purchaseDate)
      fd.append("location_id", locationId)
      fd.append("total_cost", String(receiptTotal))
      fd.append("items", JSON.stringify(cleanItems))

      const res = await fetch("/api/food-supplies", { method: "POST", body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to save receipt.")
      }
      onSaved(await res.json())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="kh-modal-dialog" style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 860, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "92dvh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--kh-sage-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-sage-d)", flexShrink: 0 }}>
            <Camera size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 19, color: "var(--kh-ink-900)" }}>Log a food supply receipt</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 1 }}>
              {scanning
                ? "Reading the receipt…"
                : file
                ? "Parsed automatically — check the items below, fix anything wrong, then confirm to save."
                : "Add the items below, or attach a photo and we'll fill them in for you."}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)", flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <div className="kh-receipt-modal-body" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
          {/* Photo strip — compact, optional, never crowds the form */}
          <div className="kh-receipt-photo-strip" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
            borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0,
          }}>
            <div className="kh-receipt-photo-frame" style={{
              position: "relative", width: 44, height: 44, flexShrink: 0,
              borderRadius: 9, background: "var(--kh-ink-50)", border: "1px dashed var(--kh-ink-200)",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Receipt" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Camera size={16} style={{ color: "var(--kh-ink-300)" }} />
              )}
              {scanning && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {file ? (
                <>
                  <div style={{ fontSize: 12, color: "var(--kh-ink-700)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                  {scanning ? (
                    <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>Reading the receipt…</div>
                  ) : scanError ? (
                    <div style={{ fontSize: 11, color: "var(--kh-pink-d)" }}>{scanError}</div>
                  ) : items.some(r => r.confidence !== null) ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--kh-sage-d)" }}>
                      <Sparkles size={11} /> Scanned automatically — check the items below
                    </div>
                  ) : null}
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>No photo attached — you can enter the items manually below.</div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*,.pdf" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <Camera size={13} /> {file ? "Retake" : "Add photo"}
            </button>
          </div>

          {/* Form + items — full width, always spacious */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div className="kh-receipt-fields-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Vendor</label>
                <input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="e.g. Interex Market" style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Purchase date *</label>
                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Location *</label>
                <select value={locationId} onChange={e => setLocationId(e.target.value)} style={inputStyle}>
                  <option value="">Select…</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Line items{items.filter(r => r.item_name.trim()).length > 0 ? ` · ${items.filter(r => r.item_name.trim()).length}` : ""}
                </span>
                {items.some(r => r.confidence === "low") && (
                  <span style={{ fontSize: 11, color: "var(--kh-marigold-d)", display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={11} />
                    {items.filter(r => r.confidence === "low").length} row{items.filter(r => r.confidence === "low").length !== 1 ? "s" : ""} flagged for low confidence — review before confirming
                  </span>
                )}
              </div>
              <div style={{ border: "1px solid var(--kh-ink-100)", borderRadius: 10, overflow: "hidden" }}>
                <table className="kh-receipt-items-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "var(--kh-ink-50)" }}>
                      <th style={{ textAlign: "left", padding: "7px 10px", fontSize: 10.5, color: "var(--kh-ink-400)", fontWeight: 600, textTransform: "uppercase" }}>Item</th>
                      <th style={{ textAlign: "right", padding: "7px 8px", fontSize: 10.5, color: "var(--kh-ink-400)", fontWeight: 600, textTransform: "uppercase", width: 60 }}>Qty</th>
                      <th style={{ textAlign: "left", padding: "7px 8px", fontSize: 10.5, color: "var(--kh-ink-400)", fontWeight: 600, textTransform: "uppercase", width: 60 }}>Unit</th>
                      <th style={{ textAlign: "right", padding: "7px 8px", fontSize: 10.5, color: "var(--kh-ink-400)", fontWeight: 600, textTransform: "uppercase", width: 80 }}>Unit cost</th>
                      <th style={{ textAlign: "right", padding: "7px 10px", fontSize: 10.5, color: "var(--kh-ink-400)", fontWeight: 600, textTransform: "uppercase", width: 90 }}>Line total</th>
                      <th style={{ width: 30 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, i) => (
                      <tr key={i} style={{ position: "relative", borderTop: "1px solid var(--kh-ink-100)", background: row.confidence === "low" ? "var(--kh-marigold-bg)" : undefined }}>
                        <td data-label="Item" className="kh-receipt-item-name-cell" style={{ padding: "2px 6px" }}>
                          <input value={row.item_name} onChange={e => updateRow(i, { item_name: e.target.value })} placeholder="Item name" style={cellInputStyle} />
                          {row.confidence === "low" && (
                            <div style={{ fontSize: 10, color: "var(--kh-marigold-d)", padding: "0 6px", display: "flex", alignItems: "center", gap: 3 }}>
                              <AlertTriangle size={9} /> Low confidence — check this row
                            </div>
                          )}
                        </td>
                        <td data-label="Qty" style={{ padding: "2px 4px" }}>
                          <input value={row.quantity} onChange={e => updateRow(i, { quantity: e.target.value })} placeholder="0" style={{ ...cellInputStyle, textAlign: "right" }} />
                        </td>
                        <td data-label="Unit" style={{ padding: "2px 4px" }}>
                          <input value={row.unit} onChange={e => updateRow(i, { unit: e.target.value })} placeholder="pc" style={cellInputStyle} />
                        </td>
                        <td data-label="Unit cost" style={{ padding: "2px 4px" }}>
                          <input value={row.unit_cost} onChange={e => updateRow(i, { unit_cost: e.target.value })} placeholder="0.00" style={{ ...cellInputStyle, textAlign: "right" }} />
                        </td>
                        <td data-label="Line total" style={{ padding: "2px 6px" }}>
                          <input value={row.line_total} onChange={e => updateRow(i, { line_total: e.target.value })} placeholder="0.00" style={{ ...cellInputStyle, textAlign: "right", fontWeight: 600 }} />
                        </td>
                        <td style={{ padding: "2px 4px", textAlign: "center" }}>
                          <button type="button" onClick={() => removeRow(i)} className="kh-receipt-remove-row" style={{ background: "none", border: "none", color: "var(--kh-ink-300)", cursor: "pointer", display: "inline-flex" }}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={addRow}
                  style={{ width: "100%", padding: "8px 10px", border: "none", borderTop: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", color: "var(--kh-ink-500)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={12} /> Add item
                </button>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
              padding: "10px 14px", borderRadius: 10,
              background: mismatch ? "var(--kh-pink-bg)" : "var(--kh-ink-50)",
            }}>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".05em" }}>Items sum</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--kh-ink-800)" }}>${itemsSum.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".05em" }}>Receipt total *</div>
                <input
                  value={totalCost}
                  onChange={e => setTotalCost(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, width: 100, textAlign: "right", fontWeight: 600, fontSize: 15, padding: "4px 8px" }}
                />
              </div>
              {mismatch && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--kh-pink-d)" }}>
                  <AlertTriangle size={13} />
                  Off by ${Math.abs(itemsSum - (receiptTotal ?? 0)).toFixed(2)} — check your rows
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)" }}>
                {error}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!readyToSave || saving}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none",
              cursor: (!readyToSave || saving) ? "not-allowed" : "pointer",
              background: (!readyToSave || saving) ? "var(--kh-ink-200)" : "var(--kh-peach)",
              color: (!readyToSave || saving) ? "var(--kh-ink-400)" : "#fff",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            {saving ? <Spinner size="sm" /> : <Check size={13} />}
            {saving ? "Saving…" : "Confirm & save"}
          </button>
        </div>
      </div>
    </div>
  )
}
