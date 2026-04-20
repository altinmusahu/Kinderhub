"use client"

type User = {
  Id: number
  Firstname: string
  [key: string]: unknown
}

export default function UsersTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return <p>No users found.</p>
  }

  const columns = Object.keys(users[0])

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              style={{
                border: "1px solid #ccc",
                padding: "8px 12px",
                textAlign: "left",
                background: "#f5f5f5",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.Id}>
            {columns.map((col) => (
              <td
                key={col}
                style={{ border: "1px solid #ccc", padding: "8px 12px" }}
              >
                {String(user[col] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
