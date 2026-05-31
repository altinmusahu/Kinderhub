"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FirstLoginModal } from "@/app/components/dashboard/FirstLoginModal"

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [firstLoginUserId, setFirstLoginUserId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message ?? "Login failed")
      setLoading(false)
      return
    }

    const data = await res.json()

    if (!data.user.is_first_login_executed) {
      setLoading(false)
      setFirstLoginUserId(data.user.id)
      return
    }

    router.push("/dashboard/staff")
  }

  return (
    <>
      {firstLoginUserId && (
        <FirstLoginModal
          userId={firstLoginUserId}
          onSuccess={() => { window.location.href = "/dashboard" }}
        />
      )}

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--kh-bg, #F7F5F2)",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 14,
          padding: "40px 44px",
          width: 400,
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          border: "1px solid var(--kh-border, #E8E4DF)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#5A3E2B", letterSpacing: "-0.5px" }}>
              Kinder<span style={{ color: "#E8866A" }}>hub</span>
            </span>
            <p style={{ marginTop: 6, fontSize: 13, color: "var(--kh-ink-400, #9A9187)" }}>
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kh-ink-600, #6B6560)" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{
                  border: "1px solid var(--kh-border, #E8E4DF)",
                  borderRadius: 8, padding: "9px 12px", fontSize: 13,
                  outline: "none", width: "100%", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kh-ink-600, #6B6560)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                style={{
                  border: "1px solid var(--kh-border, #E8E4DF)",
                  borderRadius: 8, padding: "9px 12px", fontSize: 13,
                  outline: "none", width: "100%", boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "#FDEAEA", color: "#C0392B", fontSize: 12, borderRadius: 7, padding: "8px 12px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: loading ? "#C4A898" : "#E8866A",
                color: "#fff", border: "none", borderRadius: 8,
                padding: "11px 0", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", width: "100%",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 13,
              color: "var(--kh-ink-400, #9A9187)",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "#E8866A",
                textDecoration: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
