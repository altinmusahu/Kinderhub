"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type User = {
  Id: string
  Name: string
  Lastname: string
  PhoneNumber: string
  PersonalNumber: string
  Role: "Admin" | "User"
  CreatedAt: string
  IsActive: boolean
  DateOfBirth: string
  [key: string]: unknown
}

type NewUserForm = {
  Name: string
  Lastname: string
  PhoneNumber: string
  PersonalNumber: string
  Role: "Admin" | "User"
  IsActive: boolean
  DateOfBirth: string
}

const emptyForm: NewUserForm = {
  Name: "",
  Lastname: "",
  PhoneNumber: "",
  PersonalNumber: "",
  Role: "User",
  IsActive: true,
  DateOfBirth: "",
}

const textFields = [
  { label: "Name", name: "Name", type: "text" },
  { label: "Last Name", name: "Lastname", type: "text" },
  { label: "Phone Number", name: "PhoneNumber", type: "text" },
  { label: "Personal Number", name: "PersonalNumber", type: "text" },
  { label: "Date of Birth", name: "DateOfBirth", type: "date" },
] as const

const fieldLabels: Record<string, string> = {
  Name: "Name",
  Lastname: "Last Name",
  PhoneNumber: "Phone Number",
  PersonalNumber: "Personal Number",
  Role: "Role",
  CreatedAt: "Created At",
  IsActive: "Status",
  DateOfBirth: "Date of Birth",
}

export default function UsersTable({ users }: { users: User[] }) {
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<NewUserForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  async function handleViewUser(id: string) {
    setViewLoading(true)
    const res = await fetch(`/api/users/${id}`)
    const data = await res.json()
    setViewLoading(false)

    if (res.ok) setSelectedUser(data as User)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        IsActive: true,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data?.message || "Failed to add user. Please try again.")
      return
    }

    setLocalUsers((prev) => [data as User, ...prev])
    setForm(emptyForm)
    setShowModal(false)
  }

  function closeModal() {
    setShowModal(false)
    setError("")
    setForm(emptyForm)
  }

  const columns =
    localUsers.length > 0
      ? Object.keys(localUsers[0]).filter((col) => col !== "Id")
      : []

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {localUsers.length} total users
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>Add User</Button>
      </div>

      {localUsers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>
                    {fieldLabels[col] ?? col}
                  </TableHead>
                ))}
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {localUsers.map((user) => (
                <TableRow key={user.Id}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {col === "IsActive" ? (
                        <Badge variant={user[col] ? "default" : "destructive"}>
                          {user[col] ? "Active" : "Inactive"}
                        </Badge>
                      ) : col === "Role" ? (
                        <Badge variant="secondary">{String(user[col])}</Badge>
                      ) : (
                        <span className="truncate">
                          {String(user[col] ?? "")}
                        </span>
                      )}
                    </TableCell>
                  ))}

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewUser(user.Id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {textFields.map(({ label, name, type }) => (
                <div
                  key={name}
                  className={
                    name === "PhoneNumber" || name === "PersonalNumber"
                      ? "col-span-2"
                      : ""
                  }
                >
                  <label className="mb-1 block text-sm font-medium">
                    {label}
                  </label>
                  <Input
                    type={type}
                    name={name}
                    value={form[name] as string}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <Select
                value={form.Role}
                onValueChange={(value: "Admin" | "User") =>
                  setForm((prev) => ({ ...prev, Role: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedUser || viewLoading}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {viewLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : selectedUser ? (
            <div className="space-y-3">
              {(Object.entries(selectedUser) as [string, unknown][])
                .filter(([key]) => key !== "Id")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {fieldLabels[key] ?? key}
                    </span>

                    {key === "IsActive" ? (
                      <Badge variant={value ? "default" : "destructive"}>
                        {value ? "Active" : "Inactive"}
                      </Badge>
                    ) : key === "Role" ? (
                      <Badge variant="secondary">{String(value)}</Badge>
                    ) : (
                      <span className="text-sm">{String(value ?? "—")}</span>
                    )}
                  </div>
                ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}