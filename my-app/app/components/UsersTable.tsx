"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  Id: string
  Name: string
  Lastname: string
  PhoneNumber: string
  PersonalNumber: string
  Role: string
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
  Role: string
  CreatedAt: string
  IsActive: boolean
  DateOfBirth: string
}

const emptyForm: NewUserForm = {
  Name: "",
  Lastname: "",
  PhoneNumber: "",
  PersonalNumber: "",
  Role: "User",
  CreatedAt: new Date().toISOString().split("T")[0],
  IsActive: true,
  DateOfBirth: "",
}

const textFields = [
  { label: "Name", name: "Name", type: "text" },
  { label: "Last Name", name: "Lastname", type: "text" },
  { label: "Phone Number", name: "PhoneNumber", type: "text" },
  { label: "Personal Number", name: "PersonalNumber", type: "text" },
  { label: "Date of Birth", name: "DateOfBirth", type: "date" },
  { label: "Created At", name: "CreatedAt", type: "date" },
] as const

export default function UsersTable({ users }: { users: User[] }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<NewUserForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

    setLoading(false)

    if (!res.ok) {
      setError("Failed to add user. Please try again.")
      return
    }

    setForm(emptyForm)
    setShowModal(false)
    router.refresh()
  }

  function closeModal() {
    setShowModal(false)
    setError("")
    setForm(emptyForm)
  }

  const columns =
  users.length > 0
    ? Object.keys(users[0]).filter((col) => col !== "Id")
    : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add User
        </button>
      </div>

      {/* Table */}
      {users.length === 0 ? (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user, i) => (
                <tr key={user.Id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-gray-700 max-w-45 truncate">
                      {col === "IsActive" ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user[col]
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleAddUser} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {textFields.map(({ label, name, type }) => (
                  <div key={name} className={name === "PhoneNumber" || name === "PersonalNumber" ? "col-span-2" : ""}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={form[name] as string}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

              {/* Modal footer */}
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
    </div>
  )
}
