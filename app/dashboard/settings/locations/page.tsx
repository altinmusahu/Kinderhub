"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Pencil, Trash2, X, MapPin, Check } from "lucide-react"

type Location = {
  id: string
  name: string
  street: string
  house_number: string | null
  postal_code: string | null
  city: string
  country: string
}

type FormState = {
  name: string
  street: string
  house_number: string
  postal_code: string
  city: string
  country: string
}

const EMPTY_FORM: FormState = {
  name: "", street: "", house_number: "", postal_code: "", city: "", country: "",
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, background: "var(--kh-paper)",
  color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
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

type ModalMode = { type: "create" } | { type: "edit"; location: Location }

function LocationModal({
  mode, onClose, onSaved,
}: {
  mode: ModalMode
  onClose: () => void
  onSaved: (loc: Location) => void
}) {
  const isEdit = mode.type === "edit"
  const [form, setForm] = useState<FormState>(
    isEdit
      ? {
          name:         mode.location.name,
          street:       mode.location.street,
          house_number: mode.location.house_number ?? "",
          postal_code:  mode.location.postal_code  ?? "",
          city:         mode.location.city,
          country:      mode.location.country,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        house_number: form.house_number || null,
        postal_code:  form.postal_code  || null,
      }
      const res = await fetch(
        isEdit ? `/api/locations/${mode.location.id}` : "/api/locations",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to save location.")
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
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "90dvh" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>
              {isEdit ? "Edit location" : "Add location"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>
              {isEdit ? `Editing "${mode.location.name}"` : "Create a new childcare center location"}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)", flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="kh-field-grid">
              <FieldRow label="Location name" required>
                <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="Main Campus" />
              </FieldRow>
              <FieldRow label="Country" required>
                <input name="country" value={form.country} onChange={handleChange} required style={inputStyle} placeholder="Germany" />
              </FieldRow>
              <FieldRow label="Street" required>
                <input name="street" value={form.street} onChange={handleChange} required style={inputStyle} placeholder="Musterstraße" />
              </FieldRow>
              <FieldRow label="House number">
                <input name="house_number" value={form.house_number} onChange={handleChange} style={inputStyle} placeholder="12" />
              </FieldRow>
              <FieldRow label="City" required>
                <input name="city" value={form.city} onChange={handleChange} required style={inputStyle} placeholder="Berlin" />
              </FieldRow>
              <FieldRow label="Postal code">
                <input name="postal_code" value={form.postal_code} onChange={handleChange} style={inputStyle} placeholder="10115" />
              </FieldRow>
            </div>
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
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add location"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function DeleteConfirm({ location, onClose, onDeleted }: { location: Location; onClose: () => void; onDeleted: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/locations/${location.id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete location.")
      onDeleted(location.id)
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
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)", marginBottom: 8 }}>Delete location?</div>
        <p style={{ fontSize: 13, color: "var(--kh-ink-600)", margin: "0 0 20px" }}>
          <strong>{location.name}</strong> will be permanently removed. Classes assigned to this location may be affected.
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

export default function LocationsSettingsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState<ModalMode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null)

  useEffect(() => {
    fetch("/api/locations")
      .then(r => r.json())
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(loc: Location) {
    setLocations(prev => {
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
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="kh-h1">Locations</h1>
          <p className="kh-sub">Manage your childcare center locations.</p>
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
          Add location
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "var(--kh-ink-400)" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : locations.length === 0 ? (
        <div className="kh-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--kh-ink-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--kh-ink-400)" }}>
            <MapPin size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-700)", marginBottom: 6 }}>No locations yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)", marginBottom: 18 }}>Add your first location to assign staff and classes.</div>
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: "var(--kh-peach)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={14} /> Add location
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {locations.map(loc => (
            <div key={loc.id} className="kh-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--kh-peach-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-peach)", flexShrink: 0 }}>
                <MapPin size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--kh-ink-900)" }}>{loc.name}</div>
                <div style={{ fontSize: 12, color: "var(--kh-ink-500)", marginTop: 2 }}>
                  {[loc.street, loc.house_number, loc.postal_code, loc.city, loc.country].filter(Boolean).join(", ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setModal({ type: "edit", location: loc })}
                  title="Edit location"
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-border)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(loc)}
                  title="Delete location"
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #F0CCCC", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#C0392B" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kh-ink-400)" }}>
          <Check size={12} />
          {locations.length} location{locations.length !== 1 ? "s" : ""} configured
        </div>
      )}

      {modal && (
        <LocationModal
          mode={modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          location={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
