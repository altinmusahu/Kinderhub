import type { ReactNode } from "react"
import Sidebar from "@/app/components/dashboard/Sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="kh-app">
      <Sidebar />
      <div className="kh-main">
        {children}
      </div>
    </div>
  )
}
