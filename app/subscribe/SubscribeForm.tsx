"use client"

import { useState } from "react"
import Link from "next/link"
import { Spinner } from "@/components/ui/Spinner"

type Props = {
  planId: string
  planName: string
  yearlyPrice: number
}

type Step = "tenant" | "subscription" | "success"

type TenantFormErrors = {
  Name?: string
  Slug?: string
  general?: string
}

type SubFormErrors = {
  general?: string
}

export default function SubscribeForm({ planId, planName, yearlyPrice }: Props) {
  const [step, setStep] = useState<Step>("tenant")

  // Tenant step state
  const [tenantName, setTenantName] = useState("")
  const [tenantSlug, setTenantSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [tenantErrors, setTenantErrors] = useState<TenantFormErrors>({})
  const [tenantLoading, setTenantLoading] = useState(false)

  // Subscription step state
  const [tenantId, setTenantId] = useState("")
  const [autoRenew, setAutoRenew] = useState(true)
  const [subErrors, setSubErrors] = useState<SubFormErrors>({})
  const [subLoading, setSubLoading] = useState(false)

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function slugify(value: string) {
    return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  }

  function handleNameChange(value: string) {
    setTenantName(value)
    if (!slugTouched) {
      setTenantSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setTenantSlug(slugify(value))
  }

  // ─── Step 1 submit: create tenant ──────────────────────────────────────────

  async function handleTenantSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setTenantErrors({})

    const errors: TenantFormErrors = {}
    if (!tenantName.trim()) errors.Name = "Company name is required"
    if (!tenantSlug.trim()) errors.Slug = "Slug is required"
    if (Object.keys(errors).length) {
      setTenantErrors(errors)
      return
    }

    setTenantLoading(true)
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: tenantName, Slug: tenantSlug }),
      })

      const json = await res.json()

      if (!res.ok) {
        setTenantErrors({ general: json.message ?? "Failed to create organization" })
        return
      }

      setTenantId(json.Id)
      setStep("subscription")
    } catch {
      setTenantErrors({ general: "Network error. Please try again." })
    } finally {
      setTenantLoading(false)
    }
  }

  // ─── Step 2 submit: create subscription ────────────────────────────────────

  async function handleSubscriptionSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubErrors({})
    setSubLoading(true)

    try {
      const res = await fetch("/api/tenant_subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenantId: tenantId, PlanId: planId, AutoRenew: autoRenew }),
      })

      const json = await res.json()

      if (!res.ok) {
        setSubErrors({ general: json.message ?? "Failed to create subscription" })
        return
      }

      setStep("success")
    } catch {
      setSubErrors({ general: "Network error. Please try again." })
    } finally {
      setSubLoading(false)
    }
  }

  // ─── Success screen ────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
        <p className="text-gray-500 mb-1">
          <strong>{tenantName}</strong> is now subscribed to the{" "}
          <strong>{planName}</strong> plan.
        </p>
        <p className="text-gray-400 text-sm">Your subscription runs for one year from today.</p>
        <Link
          href="/"
          className="mt-8 inline-block text-indigo-600 font-semibold hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    )
  }

  // ─── Step 1: Tenant ────────────────────────────────────────────────────────

  if (step === "tenant") {
    return (
      <>
        <StepIndicator current={1} />
        <form onSubmit={handleTenantSubmit} className="space-y-5 mt-6">
          {tenantErrors.general && <ErrorBanner message={tenantErrors.general} />}

          <Field label="Company / Organization name" error={tenantErrors.Name}>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
              className={inputClass(!!tenantErrors.Name)}
            />
          </Field>

          <Field
            label="Slug"
            hint="Unique identifier — auto-generated from the name"
            error={tenantErrors.Slug}
          >
            <input
              type="text"
              value={tenantSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="acme-inc"
              className={`${inputClass(!!tenantErrors.Slug)} font-mono`}
            />
          </Field>

          <button
            type="submit"
            disabled={tenantLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {tenantLoading && <Spinner size="sm" />}
            {tenantLoading ? "Creating…" : "Next →"}
          </button>
        </form>
      </>
    )
  }

  // ─── Step 2: Subscription ──────────────────────────────────────────────────

  return (
    <>
      <StepIndicator current={2} />
      <form onSubmit={handleSubscriptionSubmit} className="space-y-5 mt-6">
        {subErrors.general && <ErrorBanner message={subErrors.general} />}

        {/* Plan summary */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">
            Selected plan
          </p>
          <p className="text-xl font-bold text-gray-900">{planName}</p>
          <p className="text-gray-500 text-sm mt-0.5">${yearlyPrice} / year</p>
        </div>

        {/* Organization summary */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            Organization
          </p>
          <p className="font-semibold text-gray-800">{tenantName}</p>
          <p className="text-gray-400 text-sm font-mono">{tenantSlug}</p>
        </div>

        {/* Auto-renew */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Auto-renew subscription at the end of the year
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("tenant")}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={subLoading}
            className="flex-2 flex-grow inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {subLoading && <Spinner size="sm" />}
            {subLoading ? "Processing…" : "Confirm subscription"}
          </button>
        </div>
      </form>
    </>
  )
}

// ─── Small reusable pieces ──────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              n === current
                ? "bg-indigo-600 text-white"
                : n < current
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {n}
          </div>
          <span className={`text-sm ${n === current ? "font-semibold text-gray-900" : "text-gray-400"}`}>
            {n === 1 ? "Your organization" : "Confirm plan"}
          </span>
          {n < 2 && <span className="text-gray-300 mx-1">→</span>}
        </div>
      ))}
    </div>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
    hasError ? "border-red-400" : "border-gray-300"
  }`
}
