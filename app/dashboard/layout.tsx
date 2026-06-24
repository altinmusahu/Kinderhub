import type { ReactNode } from "react"
import Sidebar from "@/app/components/dashboard/Sidebar"
import ActivityFeed from "@/app/components/dashboard/ActivityFeed"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="kh-app">
      <Sidebar />
      <div className="kh-main">
        {children}
      </div>
      <ActivityFeed />
    </div>
  )
}
