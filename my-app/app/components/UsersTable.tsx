"use client"

import { useEffect, useState } from "react"

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

export default function UsersTable({ users }: { users: User[] }) {
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<NewUserForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  async function handleViewUser(id: string) {
    setViewLoading(true)
    const res = await fetch(`/api/users/${id}`)
    const data = await res.json()
    setViewLoading(false)
    if (res.ok) setSelectedUser(data as User)
  }

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{localUsers.length} total users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add User
        </button>
      </div>

      {localUsers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No users found.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {localUsers.map((user, i) => (
                <tr
                  key={user.Id}
                  className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                >
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-gray-700 max-w-45 truncate">
                      {col === "IsActive" ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user[col] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {user[col] ? "Active" : "Inactive"}
                        </span>
                      ) : col === "Role" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {String(user[col])}
                        </span>
                      ) : (
                        String(user[col] ?? "")
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewUser(user.Id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {textFields.map(({ label, name, type }) => (
                  <div
                    key={name}
                    className={name === "PhoneNumber" || name === "PersonalNumber" ? "col-span-2" : ""}
                  >
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={form[name] as string}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  name="Role"
                  value={form.Role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    name="IsActive"
                    id="IsActive"
                    checked={form.IsActive}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
                <label htmlFor="IsActive" className="text-sm text-gray-700 cursor-pointer select-none">
                  Active user
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {loading ? "Saving..." : "Save User"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View User Modal */}
      {(selectedUser || viewLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {viewLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                Loading...
              </div>
            ) : selectedUser && (
              <div className="px-6 py-4 space-y-3">
                {(Object.entries(selectedUser) as [string, unknown][])
                    .filter(([key]) => key !== "Id")
                    .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-36 shrink-0">
                      {key}
                    </span>
                    {key === "IsActive" ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {value ? "Active" : "Inactive"}
                      </span>
                    ) : key === "Role" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {String(value)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-700 text-right">{String(value ?? "—")}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}