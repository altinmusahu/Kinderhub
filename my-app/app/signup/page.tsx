"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    personal_number: "",
    date_of_birth: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          personal_number: formData.personal_number,
          date_of_birth: formData.date_of_birth,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Signup failed")
        setLoading(false)
        return
      }

      setSuccessMessage("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  const inputStyle = {
    border: "1px solid var(--kh-border, #E8E4DF)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    outline: "none" as const,
    width: "100%",
    boxSizing: "border-box" as const,
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--kh-ink-600, #6B6560)",
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--kh-bg, #F7F5F2)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "40px 44px",
          width: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          border: "1px solid var(--kh-border, #E8E4DF)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#5A3E2B",
              letterSpacing: "-0.5px",
            }}
          >
            Kinder<span style={{ color: "#E8866A" }}>hub</span>
          </span>
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "var(--kh-ink-400, #9A9187)",
            }}
          >
            Create your account
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              background: "#E8F5E9",
              color: "#2E7D32",
              fontSize: 12,
              borderRadius: 7,
              padding: "8px 12px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#FDEAEA",
              color: "#C0392B",
              fontSize: 12,
              borderRadius: 7,
              padding: "8px 12px",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Doe"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1234567890"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Personal Number / ID</label>
            <input
              type="text"
              name="personal_number"
              value={formData.personal_number}
              onChange={handleChange}
              placeholder="Your personal ID number"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: loading ? "#C4A898" : "#E8866A",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {loading ? "Creating account…" : "Sign up"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#E8866A",
              textDecoration: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
