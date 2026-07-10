"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, Pencil, Trash2, X, Check, CurrencyIcon, ChevronDown, Search } from "lucide-react"
import { Currency } from "@/app/api/modules/currency/currency.types"
import { WORLD_CURRENCIES, WorldCurrency } from "./world-currencies"

type FormState = {
  currency: string
  symbol: string
}

const EMPTY_FORM: FormState = {
  currency: "", symbol: ""
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, background: "var(--kh-paper)",
  color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
}

function CurrencyPicker({
  value, onChange,
}: {
  value: string
  onChange: (currency: WorldCurrency) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = q.length === 0
    ? WORLD_CURRENCIES
    : WORLD_CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      )

  const selected = WORLD_CURRENCIES.find(c => c.code === value)

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ color: selected ? "var(--kh-ink-800)" : "var(--kh-ink-400)" }}>
          {selected ? `${selected.code} — ${selected.name} (${selected.symbol})` : "Select a currency"}
        </span>
        <ChevronDown size={14} style={{ color: "var(--kh-ink-400)", flexShrink: 0, marginLeft: 8 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 80,
          background: "var(--kh-surface)", border: "1px solid var(--kh-border)", borderRadius: "var(--kh-radius, 10px)",
          boxShadow: "0 14px 34px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column",
          maxHeight: 360, overflow: "hidden",
        }}>
          <div style={{ position: "relative", padding: 8, borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
            <Search size={13} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "var(--kh-ink-400)" }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search currency or symbol…"
              style={{ ...inputStyle, padding: "8px 10px 8px 28px" }}
            />
          </div>
          <div style={{ overflowY: "auto", minHeight: 0 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px 12px", fontSize: 12.5, color: "var(--kh-ink-400)", textAlign: "center" }}>
                No currency found.
              </div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setQuery("") }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                    padding: "8px 12px", border: "none", background: c.code === value ? "var(--kh-paper-2)" : "transparent",
                    cursor: "pointer", fontSize: 13, color: "var(--kh-ink-800)", textAlign: "left",
                  }}
                >
                  <span>
                    <strong>{c.code}</strong>
                    <span style={{ color: "var(--kh-ink-500)", marginLeft: 6 }}>{c.name}</span>
                  </span>
                  <span style={{ color: "var(--kh-ink-500)", flexShrink: 0, marginLeft: 8 }}>{c.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}{required && <span style={{ color: "var(--kh-peach)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

type ModalMode = { type: "create" } | { type: "edit"; currency: Currency }

function CurrencyModal({
  mode, onClose, onSaved,
}: {
  mode: ModalMode
  onClose: () => void
  onSaved: (loc: Currency) => void
}) {
  const isEdit = mode.type === "edit"
  const [form, setForm] = useState<FormState>(
    isEdit
      ? {
          currency: mode.currency.currency,
          symbol:   mode.currency.symbol,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function handlePick(c: WorldCurrency) {
    setForm({ currency: c.code, symbol: c.symbol })
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.currency || !form.symbol) {
      setError("Please select a currency.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      const res = await fetch(
        isEdit ? `/api/currency/${mode.currency.id}` : "/api/currency",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to save currency.")
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
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "visible", maxHeight: "90dvh" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>
              {isEdit ? "Edit currency" : "Add currency"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>
              {isEdit ? `Editing "${mode.currency.currency}"` : "Create a new currency"}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)", flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "visible" }}>
          <div style={{ padding: "16px 20px", minHeight: 520, display: "flex", flexDirection: "column", gap: 12 }}>
            <FieldRow label="Currency" required>
              <CurrencyPicker value={form.currency} onChange={handlePick} />
            </FieldRow>
          </div>

          {error && (
            <div style={{ margin: "0 20px 8px", padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)", flexShrink: 0 }}>
              {error}
            </div>
          )}

          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "var(--kh-ink-200)" : "var(--kh-peach)", color: saving ? "var(--kh-ink-400)" : "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add currency"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function DeleteConfirm({ currency, onClose, onDeleted }: { currency: Currency; onClose: () => void; onDeleted: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/currency/${currency.id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete currency.")
      onDeleted(currency.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setDeleting(false)
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 380, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", padding: "24px 22px" }}>
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)", marginBottom: 8 }}>Delete currency?</div>
        <p style={{ fontSize: 13, color: "var(--kh-ink-600)", margin: "0 0 20px" }}>
          <strong>{currency.currency}</strong> will be permanently removed. Staff salaries assigned to this currency may be affected.
        </p>
        {error && <div style={{ marginBottom: 12, padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)" }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: deleting ? "not-allowed" : "pointer", background: deleting ? "var(--kh-ink-200)" : "#C0392B", color: deleting ? "var(--kh-ink-400)" : "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {deleting && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function CurrencySettingsPage() {
  const [currency, setCurrency] = useState<Currency[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState<ModalMode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null)

  useEffect(() => {
    fetch("/api/currency")
      .then(r => r.json())
      .then(data => setCurrency(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(loc: Currency) {
    setCurrency(prev => {
      const idx = prev.findIndex(l => l.id === loc.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = loc
        return next
      }
      return [...prev, loc]
    })
  }

  function handleDeleted(id: string) {
    setCurrency(prev => prev.filter(l => l.id !== id))
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="kh-h1" style={{ display: "flex", alignItems: "center" }}>
            Currency
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer",
            background: "var(--kh-peach)", color: "#fff",
          }}
        >
          <Plus size={14} />
          Add currency
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "var(--kh-ink-400)" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : currency.length === 0 ? (
        <div className="kh-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--kh-ink-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--kh-ink-400)" }}>
            <CurrencyIcon size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-700)", marginBottom: 6 }}>No currency yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)", marginBottom: 18 }}>Add your first currency to assign in staff salaries.</div>
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: "var(--kh-peach)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={14} /> Add currency
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {currency.map(loc => (
            <div key={loc.id} className="kh-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--kh-peach-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-peach)", flexShrink: 0 }}>
                <CurrencyIcon size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--kh-ink-900)" }}>{loc.currency}</div>
                <div style={{ fontSize: 12, color: "var(--kh-ink-500)", marginTop: 2 }}>{loc.symbol}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setModal({ type: "edit", currency: loc })}
                  title="Edit currency"
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-border)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(loc)}
                  title="Delete currency"
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #F0CCCC", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#C0392B" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currency.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kh-ink-400)" }}>
          <Check size={12} />
          {currency.length} currenc{currency.length !== 1 ? "ies" : "y"} configured
        </div>
      )}

      {modal && (
        <CurrencyModal
          mode={modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          currency={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
