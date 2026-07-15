import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import React from "react"
import { verifyToken, cookieName } from "@/lib/auth"
import { DocumentsService } from "@/app/api/modules/documents/documents.service"
import type { DocumentWithSubject } from "@/app/api/modules/documents/documents.types"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import UploadDocumentModal from "@/components/ui/UploadDocumentModal"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { hasAnyAccess, getMyPermissionLevel } from "@/lib/permissions/can"
import DeleteDocumentButton from "./DeleteDocumentButton"

function fileName(url: string) {
  const withoutQuery = url.split("?")[0]
  const raw = withoutQuery.split("/").pop() ?? ""
  return raw.replace(/^\d+_/, "")
}

const TYPE_COLORS: Record<string, string> = {
  Family: "#6BA07C",
  Staff:  "#C9AE4E",
  Child:  "#D97F8C",
}

const AVATAR_COLORS = ["#E8866A", "#6BA07C", "#C9AE4E", "#D97F8C", "#6A9EC8", "#A07CB4", "#7CA0B4"]
function avatarColor(id: string) {
  let n = 0
  for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

function buildColumns(canDelete: boolean): Column<DocumentWithSubject>[] {
  return [
    {
      key: "name",
      header: "Document",
      cell: (d) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>📄</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{fileName(d.storage_path)}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Attached to",
      cell: (d) => {
        const tc = TYPE_COLORS[d.subject_type ?? ""] ?? "var(--kh-ink-400)"
        return d.subject_type ? (
          <span style={{ fontSize: 11, fontWeight: 500, color: tc, background: tc + "18", borderRadius: 99, padding: "2px 8px" }}>{d.subject_type}</span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>—</span>
        )
      },
    },
    {
      key: "subject",
      header: "Family / Staff / Child",
      cell: (d) => {
        const id = d.family_id ?? d.user_id ?? d.kid_id ?? d.id
        const ac = avatarColor(id)
        const name = d.subject_name ?? "Unknown"
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="kh-avatar" style={{ background: ac + "22", color: ac, width: 22, height: 22, fontSize: 9 }}>{initials(name)}</span>
            <span style={{ fontSize: 12, color: "var(--kh-ink-600)" }}>{name}</span>
          </div>
        )
      },
    },
    {
      key: "date",
      header: "Date",
      cellStyle: { fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" },
      cell: (d) => new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    },
    {
      key: "actions",
      header: "",
      cell: (d) => (
        <div style={{ display: "flex", gap: 6 }}>
          <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="kh-btn" style={{ padding: "3px 8px", fontSize: 11, textDecoration: "none" }}>View</a>
          {canDelete && <DeleteDocumentButton documentId={d.id} />}
        </div>
      ),
    },
  ]
}

export default async function DocumentsPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const allowed = await hasAnyAccess(session, "documents")
  if (!allowed) return <AccessDenied />

  const level = await getMyPermissionLevel(session, "documents")
  const canUpload = level === "edit" || level === "full" || level === "own_only"
  const canDelete = level === "full"

  let documents: DocumentWithSubject[] = []
  try {
    documents = await DocumentsService.getAllForTenant(session.tenant_id)
  } catch {
    // renders empty state below
  }

  const familyCount = documents.filter(d => d.subject_type === "Family").length
  const staffCount = documents.filter(d => d.subject_type === "Staff").length
  const childCount = documents.filter(d => d.subject_type === "Child").length

  const stats = [
    { label: "Total documents", value: String(documents.length) },
    { label: "Family",          value: String(familyCount), color: "#6BA07C" },
    { label: "Staff",           value: String(staffCount),  color: "#B07A1A" },
    { label: "Child",           value: String(childCount),  color: "#C0392B" },
  ]

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Documents</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          {canUpload && <UploadDocumentModal />}
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 14 }}>
          <h1 className="kh-h1">Documents</h1>
          <p className="kh-sub">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="kh-stats-grid" style={{ marginBottom: 4 }}>
          {stats.map((s, i) => (
            <div key={i} className="kh-card kh-stat-card">
              <div className="kh-stat-label">{s.label}</div>
              <div className="kh-stat-value-row" style={{ marginTop: 8 }}>
                <span className="kh-stat-value" style={{ color: s.color ?? "var(--kh-ink-900)" }}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 ? (
          <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
            No documents yet. Upload the first one using the button above.
          </div>
        ) : (
          <DataTable
            columns={buildColumns(canDelete)}
            rows={documents}
            getRowKey={(d) => d.id}
          />
        )}
      </div>
    </div>
  )
}
