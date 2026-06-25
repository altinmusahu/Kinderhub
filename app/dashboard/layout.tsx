import type { ReactNode } from "react"
import DashboardShell from "@/app/components/dashboard/DashboardShell"
import { fetchActivityItems } from "@/app/components/dashboard/ActivityFeed"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { items, error } = await fetchActivityItems()

  return (
    <DashboardShell activityItems={items} activityError={error}>
      {children}
    </DashboardShell>
  )
}
