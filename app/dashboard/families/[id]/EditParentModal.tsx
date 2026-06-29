"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import type { FamilyParent } from "@/app/api/modules/families/families.types"

type Props = {
  parent: FamilyParent
  onClose: () => void
  onSuccess: () => void
}

const FIELDS = [
  { label: "First name",        name: "firstname",       type: "text", required: true,  placeholder: "Jane"            },
  { label: "Last name",         name: "lastname",        type: "text", required: true,  placeholder: "Doe"             },
  { label: "Phone number",      name: "phone_number",    type: "tel",  required: false, placeholder: "+1 555 000 0000" },
  { label: "Personal No. / ID", name: "personal_number", type: "text", required: false, placeholder: "ID number"       },
  { label: "Date of birth",     name: "date_of_birth",   type: "date", required: false, placeholder: ""                },
  { label: "Address",           name: "address",         type: "text", required: false, placeholder: "123 Main St"     },
] as const

type FormState = {
  firstname: string
  lastname: string
  phone_number: string
  personal_number: string
  date_of_birth: string
  address: string
  pick_up: boolean
}

export default function EditParentModal({ parent, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    firstname:       parent.firstname       ?? "",
    lastname:        parent.lastname        ?? "",
    phone_number:    parent.phone_number    ?? "",
    personal_number: parent.personal_number ?? "",
    date_of_birth:   parent.date_of_birth   ?? "",
    address:         parent.address         ?? "",
    pick_up:         parent.pick_up         ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/parents/${parent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to update parent.")
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, background: "var(--kh-paper)",
    color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "90dvh" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>Edit parent / guardian</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>
              Editing {parent.firstname} {parent.lastname}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)", flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>

            <div className="kh-field-grid">
              {FIELDS.map(({ label, name, type, required, placeholder }) => (
                <div key={name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    {label}{required && <span style={{ color: "var(--kh-peach)", marginLeft: 2 }}>*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name as keyof Omit<FormState, "pick_up">] as string}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* Pick-up toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)" }}>
              <input
                type="checkbox"
                name="pick_up"
                checked={form.pick_up}
                onChange={handleChange}
                style={{ width: 15, height: 15, accentColor: "var(--kh-sage)", cursor: "pointer" }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>Authorised for pick-up</div>
                <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 1 }}>This guardian can pick up children from the facility.</div>
              </div>
            </label>

          </div>

          {error && (
            <div style={{ margin: "0 20px 8px", padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)", flexShrink: 0 }}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "var(--kh-ink-200)" : "var(--kh-peach)", color: saving ? "var(--kh-ink-400)" : "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
