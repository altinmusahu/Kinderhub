"use client"

import { useState, useTransition } from "react"
import { Modal, MField, MInput, MBtn } from "@/components/ui/Modal"
import type { LeaveSummary } from "@/app/api/modules/leave_requests/leave_requests.types"

export function EditBalanceModal({ userId, summary, onSaved, trigger }: {
  userId: string
  summary: LeaveSummary
  onSaved: (summary: LeaveSummary) => void
  trigger?: (open: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      entitled_days: fd.get("entitled_days"),
      carried_over: fd.get("carried_over"),
    }
    startSave(async () => {
      const res = await fetch(`/api/users/${userId}/leaves`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated: LeaveSummary = await res.json()
        onSaved(updated)
        setOpen(false)
        setError("")
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d?.error ?? "Failed to update balance.")
      }
    })
  }

  const baseEntitled = summary.entitled - summary.carriedOver

  return (
    <>
      {trigger ? trigger(() => setOpen(true)) : (
        <button className="kh-btn" style={{ fontSize: 12 }} onClick={() => setOpen(true)}>
          Edit balance
        </button>
      )}
      <Modal
        open={open}
        onClose={() => { setOpen(false); setError("") }}
        title="Edit leave balance"
        sub="Set this employee's annual entitlement for this year"
        width={420}
        footer={
          <>
            <MBtn variant="secondary" onClick={() => { setOpen(false); setError("") }}>Cancel</MBtn>
            <MBtn variant="accent" disabled={saving} onClick={() => (document.getElementById("edit-balance-form") as HTMLFormElement)?.requestSubmit()}>
              {saving ? "Saving…" : "Save balance"}
            </MBtn>
          </>
        }
      >
        <form id="edit-balance-form" onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <MField label="Entitled days" hint="Base annual allowance, not counting carry-over" required>
            <MInput name="entitled_days" type="number" min={0} step={0.5} defaultValue={baseEntitled} required />
          </MField>
          <MField label="Carried over" hint="Unused days brought forward from last year" required>
            <MInput name="carried_over" type="number" min={0} step={0.5} defaultValue={summary.carriedOver} required />
          </MField>
          {error && <p style={{ fontSize: 12, color: "#D2592F", margin: 0 }}>{error}</p>}
        </form>
      </Modal>
    </>
  )
}
