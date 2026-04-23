import type { ReactNode } from "react"
import Sidebar from "@/app/components/dashboard/Sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-16 overflow-auto relative">
        {children}
      </main>
    </div>
  )
}
