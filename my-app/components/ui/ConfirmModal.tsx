"use client"

import { Modal, MBtn } from "./Modal"

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  details?: { label: string; value: string }[]
  confirmLabel?: string
  confirming?: boolean
}

export default function ConfirmModal({ open, onClose, onConfirm, title, description, details, confirmLabel = "Confirm", confirming }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      sub={description}
      icon="⚠"
      iconBg="#FCEEF0"
      iconColor="#A85060"
      width={440}
      footer={
        <>
          <MBtn variant="ghost" onClick={onClose}>Cancel</MBtn>
          <MBtn variant="danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Removing…" : confirmLabel}
          </MBtn>
        </>
      }
    >
      <div style={{ padding: "12px 22px 16px" }}>
        {details && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {details.map(d => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid var(--kh-border)", borderRadius: 10, background: "var(--kh-ink-50)" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)", minWidth: 96 }}>{d.label}</span>
                <span style={{ fontSize: 12, color: "var(--kh-ink-500)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: 13, color: "var(--kh-ink-500)", lineHeight: 1.55, margin: 0 }}>
          This action cannot be undone from here.
        </p>
      </div>
    </Modal>
  )
}
