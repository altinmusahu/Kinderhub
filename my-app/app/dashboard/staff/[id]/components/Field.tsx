"use client"

export function Field({
  label, name, value, type = "text", disabled = false,
}: { label: string; name: string; value: string; type?: string; disabled?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
      <label htmlFor={name} style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        disabled={disabled}
        style={{
          background: disabled ? "transparent" : "var(--kh-ink-50)",
          border: disabled ? "none" : "1px solid var(--kh-border)",
          borderRadius: 6,
          padding: disabled ? "0" : "5px 9px",
          fontSize: 12.5,
          color: disabled ? "var(--kh-ink-800)" : "var(--kh-ink-900)",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
        }}
      />
    </div>
  )
}

export function SaveBar({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--kh-border)", background: "var(--kh-ink-50)" }}>
      <button type="submit" disabled={saving} className="kh-btn kh-btn--primary" style={{ fontSize: 12.5 }}>
        {saving ? "Saving…" : "Save changes"}
      </button>
      <button type="button" className="kh-btn" style={{ fontSize: 12.5 }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}
