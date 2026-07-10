"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { User, UserById } from "@/app/api/modules/user/user.types"

type DisplayUser = Omit<User, "password_hash">

type NewUserForm = {
  name: string
  lastname: string
  email: string
  phone_number: string
  personal_number: string
  role: string
  is_active: boolean
  date_of_birth: string
  street: string
  house_number: string
  city: string
  postal_code: string
  country: string
}

const emptyForm: NewUserForm = {
  name: "",
  lastname: "",
  email: "",
  phone_number: "",
  personal_number: "",
  role: "User",
  is_active: true,
  date_of_birth: "",
  street: "",
  house_number: "",
  city: "",
  postal_code: "",
  country: "",
}

const fieldLabels: Record<string, string> = {
  name: "Name",
  lastname: "Last Name",
  email: "Email",
  phone_number: "Phone",
  personal_number: "Personal No.",
  role: "Role",
  created_at: "Created At",
  is_active: "Status",
  date_of_birth: "Date of Birth",
  tenant_id: "Tenant",
  is_first_login_executed: "First Login Done",
  street: "Street",
  house_number: "House No.",
  city: "City",
  postal_code: "Postal Code",
  country: "Country",
}

const HIDDEN_COLS = new Set(["id", "tenant_id"])

export default function UsersTable({ users }: { users: DisplayUser[] }) {
  const [localUsers, setLocalUsers] = useState<DisplayUser[]>(users)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<NewUserForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserById | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => { setLocalUsers(users) }, [users])

  const columns = localUsers.length > 0
    ? Object.keys(localUsers[0]).filter((col) => !HIDDEN_COLS.has(col))
    : []

  async function handleViewUser(id: string) {
    setViewLoading(true)
    const res = await fetch(`/api/users/${id}`)
    const data = await res.json()
    setViewLoading(false)
    if (res.ok) setSelectedUser(data as UserById)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, is_active: true }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data?.message || "Failed to add user.")
      return
    }
    setLocalUsers((prev) => [data as DisplayUser, ...prev])
    setForm(emptyForm)
    setShowModal(false)
  }

  function closeModal() {
    setShowModal(false)
    setError("")
    setForm(emptyForm)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{localUsers.length} total users</p>
        <Button onClick={() => setShowModal(true)}>Add User</Button>
      </div>

      {localUsers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No users found.</div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => <TableHead key={col}>{fieldLabels[col] ?? col}</TableHead>)}
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localUsers.map((user) => (
                <TableRow key={user.id}>
                  {columns.map((col) => {
                    const val = (user as Record<string, unknown>)[col]
                    return (
                      <TableCell key={col}>
                        {col === "is_active" ? (
                          <Badge variant={val ? "default" : "destructive"}>{val ? "Active" : "Inactive"}</Badge>
                        ) : col === "is_first_login_executed" ? (
                          <Badge variant={val ? "default" : "secondary"}>{val ? "Yes" : "No"}</Badge>
                        ) : col === "role" ? (
                          <Badge variant="secondary">{String(val)}</Badge>
                        ) : (
                          <span className="truncate">{String(val ?? "")}</span>
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUser(user.id)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add User Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {([
                { label: "First Name",      name: "name",            type: "text" },
                { label: "Last Name",       name: "lastname",        type: "text" },
                { label: "Email",           name: "email",           type: "email" },
                { label: "Phone Number",    name: "phone_number",    type: "text" },
                { label: "Personal Number", name: "personal_number", type: "text" },
                { label: "Date of Birth",   name: "date_of_birth",   type: "date" },
              ] as const).map(({ label, name, type }) => (
                <div key={name} className={name === "phone_number" || name === "personal_number" || name === "email" ? "col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-medium">{label}</label>
                  <Input type={type} name={name} value={form[name] as string} onChange={handleChange} required />
                </div>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Address (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: "Street",       name: "street" },
                  { label: "House Number", name: "house_number" },
                  { label: "City",         name: "city" },
                  { label: "Postal Code",  name: "postal_code" },
                ] as const).map(({ label, name }) => (
                  <div key={name}>
                    <label className="mb-1 block text-sm font-medium">{label}</label>
                    <Input type="text" name={name} value={form[name]} onChange={handleChange} />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">Country</label>
                  <Input type="text" name="country" value={form.country} onChange={handleChange} />
                </div>
              </div>
            </div>
            {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={!!selectedUser || viewLoading} onOpenChange={(open) => { if (!open) setSelectedUser(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : selectedUser ? (
            <div className="space-y-3">
              {(Object.entries(selectedUser.user) as [string, unknown][])
                .filter(([key]) => key !== "id" && key !== "tenant_id")
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="text-sm font-medium text-muted-foreground">{fieldLabels[key] ?? key}</span>
                    {key === "is_active" ? (
                      <Badge variant={value ? "default" : "destructive"}>{value ? "Active" : "Inactive"}</Badge>
                    ) : key === "role" ? (
                      <Badge variant="secondary">{String(value)}</Badge>
                    ) : (
                      <span className="text-sm">{String(value ?? "—")}</span>
                    )}
                  </div>
                ))}

              <p className="pt-2 text-sm font-medium text-muted-foreground">Address</p>
              {(["street", "house_number", "city", "postal_code", "country"] as const).map((key) => (
                <div key={key} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span className="text-sm font-medium text-muted-foreground">{fieldLabels[key]}</span>
                  <span className="text-sm">{selectedUser.address?.[key] ?? "—"}</span>
                </div>
              ))}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
