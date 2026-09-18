import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken, cookieName } from "@/lib/auth"
import { FamiliesService } from "@/app/api/modules/families/families.service"
import AddFamilyModal from "@/components/ui/AddFamilyModal"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import ExportFamiliesButton from "@/app/components/dashboard/ExportFamiliesButton"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { hasAnyAccess, getMyPermissionLevel } from "@/lib/permissions/can"
import { FamiliesTable } from "./components/FamiliesTable"

export default async function FamiliesPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")
  const { tenant_id } = session

  const allowed = await hasAnyAccess(session, "families")
  if (!allowed) return <AccessDenied />

  const level = await getMyPermissionLevel(session, "families")
  const canDrillDown = level !== "view"
  const canCreate = level === "edit" || level === "full"
  const canExport = level === "edit" || level === "full"

  const families = await FamiliesService.getAllWithDetails(tenant_id)

  const activeCount   = families.filter(f => f.status === "Active").length
  const waitlistCount = families.filter(f => f.status === "Waitlist").length
  const pausedCount   = families.filter(f => f.status === "Paused").length

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Families</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          {canExport && <ExportFamiliesButton /> }
          {canCreate && <AddFamilyModal />}
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 6 }}>
          <h1 className="kh-h1">
            Families
          </h1>

          <p className="kh-sub">
            {families.length} total · {activeCount} active · {waitlistCount} waitlist · {pausedCount} paused
          </p>
        </div>

        {families.length === 0 ? (
          <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
            No families yet. Add the first one using the button above.
          </div>
        ) : (
          <FamiliesTable families={families} canDrillDown={canDrillDown} />
        )}
      </div>
    </div>
  )
}
