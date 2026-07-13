"use client"

import { useEffect, useState } from "react"
import type { ContractTemplate } from "@/app/api/modules/contract_templates/contract_templates.types"
import { Spinner } from "@/components/ui/Spinner"

type FormState = {
  name: string
  type: string
  body: string
  is_default: boolean
  is_active: boolean
}

const EMPTY_FORM: FormState = { name: "", type: "", body: "", is_default: false, is_active: true }

const TEMPLATE_TYPES = [
  "Enrollment Agreement",
  "Tuition Contract",
  "Authorization Form",
  "Medical Release",
  "Photo & Media Release",
  "Transportation Agreement",
  "Other",
]

export default function ContractTemplatesSettingsPage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/contract_templates")
      if (!res.ok) throw new Error("Failed to load templates")
      setTemplates(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(t: ContractTemplate) {
    setEditId(t.id)
    setForm({ name: t.name, type: t.type, body: t.body, is_default: t.is_default, is_active: t.is_active })
    setFormError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError("Name is required"); return }
    if (!form.type.trim()) { setFormError("Type is required"); return }
    if (!form.body.trim()) { setFormError("Body is required"); return }
    setSaving(true)
    setFormError(null)
    try {
      const url = editId ? `/api/contract_templates/${editId}` : "/api/contract_templates"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Save failed")
      }
      closeForm()
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template? This cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/contract_templates/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await load()
    } catch {
      alert("Failed to delete template")
    } finally {
      setDeletingId(null)
    }
  }

  async function toggleActive(t: ContractTemplate) {
    setTogglingId(t.id)
    try {
      await fetch(`/api/contract_templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !t.is_active }),
      })
      await load()
    } catch {
      // silent
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 className="kh-h1">Contract Templates</h1>
          <p className="kh-sub" style={{ margin: 0 }}>
            Reusable templates for enrollment agreements, tuition contracts, and other documents.
            Use <code style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11 }}>{"{{variable}}"}</code> placeholders for dynamic values.
          </p>
        </div>
        <button className="kh-btn kh-btn--primary" onClick={openCreate}>
          + New template
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="kh-card" style={{
            width: 680, maxHeight: "90vh", overflow: "auto",
            padding: "28px 32px", display: "flex", flexDirection: "column", gap: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--kh-ink-900)", margin: 0 }}>
                {editId ? "Edit template" : "New contract template"}
              </h2>
              <button className="kh-btn" onClick={closeForm} style={{ padding: "4px 10px" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="kh-label">Name *</label>
                <input
                  className="kh-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Standard Enrollment Agreement"
                />
              </div>
              <div>
                <label className="kh-label">Type *</label>
                <select
                  className="kh-input"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="">Select type…</option>
                  {TEMPLATE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="kh-label">
                Body *
                <span style={{ fontWeight: 400, color: "var(--kh-ink-400)", marginLeft: 8, fontSize: 11 }}>
                  {"Use {{family_name}}, {{kid_name}}, {{valid_from}}, {{valid_until}} etc."}
                </span>
              </label>
              <textarea
                className="kh-input"
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={12}
                style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, resize: "vertical" }}
                placeholder={"This Enrollment Agreement (\"Agreement\") is entered into between {{family_name}} (\"Parent/Guardian\") and Kinderhub Childcare (\"Center\") on {{valid_from}}.\n\nChild: {{kid_name}}\nEnrollment period: {{valid_from}} to {{valid_until}}\n\n..."}
              />
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                />
                <span style={{ color: "var(--kh-ink-700)" }}>Set as default template</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                <span style={{ color: "var(--kh-ink-700)" }}>Active</span>
              </label>
            </div>

            {formError && (
              <div style={{ background: "#FEE8E8", color: "#7A0000", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                {formError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="kh-btn" onClick={closeForm} disabled={saving}>Cancel</button>
              <button className="kh-btn kh-btn--primary" onClick={handleSave} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {saving && <Spinner size="sm" />}
                {saving ? "Saving…" : editId ? "Save changes" : "Create template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--kh-ink-400)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>
          <Spinner size="md" />
          Loading templates…
        </div>
      )}

      {error && (
        <div style={{ background: "#FEE8E8", color: "#7A0000", padding: "14px 18px", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div className="kh-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>📄</div>
          <div style={{ fontWeight: 600, color: "var(--kh-ink-800)", marginBottom: 6 }}>No templates yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)", marginBottom: 20 }}>
            Create reusable contract templates with dynamic placeholders.
          </div>
          <button className="kh-btn kh-btn--primary" onClick={openCreate}>+ New template</button>
        </div>
      )}

      {!loading && !error && templates.length > 0 && (
        <div className="kh-card" style={{ overflow: "hidden" }}>
          <table className="kh-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Default</th>
                <th>Updated</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>
                      {t.body.slice(0, 60)}{t.body.length > 60 ? "…" : ""}
                    </div>
                  </td>
                  <td>
                    <span className="kh-status-badge" style={{ background: "var(--kh-ink-50)", color: "var(--kh-ink-600)" }}>
                      {t.type}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(t)}
                      disabled={togglingId === t.id}
                      style={{ background: "none", border: "none", padding: 0, cursor: togglingId === t.id ? "not-allowed" : "pointer" }}
                    >
                      <span className="kh-status-badge" style={{
                        background: t.is_active ? "#EAF3EC" : "#F5F3EF",
                        color: t.is_active ? "#2E5E3A" : "#9E968A",
                      }}>
                        {togglingId === t.id ? <Spinner size="sm" /> : <span className="kh-pill-dot" style={{ background: t.is_active ? "#6BA07C" : "#C4BDB5" }} />}
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  <td>
                    {t.is_default ? (
                      <span className="kh-status-badge" style={{ background: "#FEF0E8", color: "#7A3318" }}>
                        <span className="kh-pill-dot" style={{ background: "#E8866A" }} />
                        Default
                      </span>
                    ) : (
                      <span style={{ color: "var(--kh-ink-300)", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>
                    {t.updated_at ? new Date(t.updated_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="kh-btn" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => openEdit(t)}>
                        Edit
                      </button>
                      <button
                        className="kh-btn"
                        style={{ fontSize: 12, padding: "4px 10px", color: "#B22222", display: "inline-flex", alignItems: "center", gap: 5 }}
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                      >
                        {deletingId === t.id && <Spinner size="sm" />}
                        {deletingId === t.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Variable reference */}
      <div className="kh-card" style={{ marginTop: 20, padding: "18px 22px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--kh-ink-700)", marginBottom: 10 }}>
          Available template variables
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            "{{family_name}}",
            "{{kid_name}}",
            "{{kid_dob}}",
            "{{class_name}}",
            "{{valid_from}}",
            "{{valid_until}}",
            "{{contract_number}}",
            "{{center_name}}",
            "{{today}}",
          ].map(v => (
            <code key={v} style={{
              fontFamily: "var(--kh-font-mono)", fontSize: 11,
              background: "var(--kh-ink-50)", color: "var(--kh-ink-700)",
              padding: "3px 8px", borderRadius: 5, border: "1px solid var(--kh-border)",
            }}>
              {v}
            </code>
          ))}
        </div>
      </div>
    </>
  )
}
