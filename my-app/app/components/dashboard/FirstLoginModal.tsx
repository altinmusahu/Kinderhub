"use client"

import React, { useState } from "react"

interface Props {
  userId: string
  onSuccess: () => void
}

export function FirstLoginModal({ userId, onSuccess }: Props) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to change password")
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "32px 36px",
        width: 380, boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--kh-ink-900)" }}>
          Set your password
        </h2>
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", marginBottom: 24 }}>
          This is your first login. Please set a new password before continuing.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--kh-ink-600)" }}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={{
                border: "1px solid var(--kh-border)", borderRadius: 7, padding: "8px 12px",
                fontSize: 13, outline: "none", width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--kh-ink-600)" }}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
              style={{
                border: "1px solid var(--kh-border)", borderRadius: 7, padding: "8px 12px",
                fontSize: 13, outline: "none", width: "100%",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#C0392B", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="kh-btn kh-btn--primary"
            style={{ marginTop: 4, padding: "10px 0", fontSize: 13, width: "100%" }}
          >
            {loading ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  )
}
