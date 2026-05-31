"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

export default function AddStaffModal({ triggerLabel = "+ Add staff" }: { triggerLabel?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone_number: "",
    personal_number: "",
    role: "",
    department_id: "",
    position_name: "",
    is_active: true,
    date_of_birth: "",
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }

  useEffect(() => {
    setLoadingDepartments(true)
    fetch("/api/departments")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load departments")
        return res.json()
      })
      .then((data) => {
        setDepartments(
          Array.isArray(data)
            ? data.map((dept: any) => ({ id: dept.id, name: dept.name }))
            : []
        )
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepartments(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = {
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        phone_number: form.phone_number,
        personal_number: form.personal_number,
        role: form.role,
        is_active: form.is_active,
        date_of_birth: form.date_of_birth,
        department_id: form.department_id || undefined,
        position_name: form.position_name || undefined,
      }

      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Create failed" }))
        throw new Error(json?.message || json?.error || "Create failed")
      }

      // success: close modal and refresh server components
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent>
        <div className="kh-modal-content">
          <DialogHeader>
            <DialogTitle className="kh-modal-title">Add staff</DialogTitle>
            <DialogDescription className="kh-modal-description">Create a new staff member and assign them to your team.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="kh-modal-form">
            <div className="kh-field-grid">
              <input name="name" placeholder="First name" value={form.name} onChange={onChange} className="kh-input" required />
              <input name="lastname" placeholder="Last name" value={form.lastname} onChange={onChange} className="kh-input" required />
            </div>

            <div className="kh-field-grid">
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} className="kh-input" required />
              <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={onChange} className="kh-input" />
            </div>

            <div className="kh-field-grid">
              <input name="personal_number" placeholder="Personal number" value={form.personal_number} onChange={onChange} className="kh-input" />
              <input name="date_of_birth" type="date" placeholder="Date of birth" value={form.date_of_birth} onChange={onChange} className="kh-input" />
            </div>

            <div className="kh-field-grid">
              <select name="department_id" value={form.department_id} onChange={onChange} className="kh-input">
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <input name="position_name" placeholder="Position" value={form.position_name} onChange={onChange} className="kh-input" />
            </div>

            <div className="kh-toggle-row">
              <select name="role" value={form.role} onChange={onChange} className="kh-input" required>
                <option value="">Select role</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                Active
              </label>
            </div>

            {loadingDepartments && <div className="text-sm text-slate-500">Loading departments...</div>}

            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="kh-modal-footer">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
