"use client"

import { useEffect, useState } from "react"
import { Pencil, Pin, Plus, Trash2, X, Check } from "lucide-react"
import type { ClassHubPostWithAuthor } from "@/app/api/modules/class_hub_posts/class_hub_posts.types"
import type { ClassRule } from "@/app/api/modules/class_rules/class_rules.types"
import type { ClassEvent } from "@/app/api/modules/class_events/class_events.types"
import { Spinner } from "@/components/ui/Spinner"

const POST_TYPES = ["Daily note", "Rule", "Issue", "Info"] as const

const POST_TONE: Record<string, { bg: string; color: string }> = {
  "Daily note": { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)" },
  Issue: { bg: "#FEF3E2", color: "#B07A1A" },
  Info: { bg: "var(--kh-marigold-bg)", color: "#8A6416" },
  Rule: { bg: "var(--kh-peach-bg)", color: "var(--kh-peach-d)" },
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function Composer({ classId, onPosted }: { classId: string; onPosted: (p: ClassHubPostWithAuthor) => void }) {
  const [type, setType] = useState<typeof POST_TYPES[number]>("Daily note")
  const [body, setBody] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!body.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/classes/${classId}/hub/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_type: type, body: body.trim() }),
      })
      if (res.ok) {
        const post: ClassHubPostWithAuthor = await res.json()
        onPosted(post)
        setBody("")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="kh-card" style={{ padding: "14px 16px" }}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something with class parents…"
        rows={2}
        style={{ width: "100%", border: "1px solid var(--kh-border)", borderRadius: 10, padding: "10px 12px", fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {POST_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              fontSize: 11.5, fontWeight: 500, borderRadius: 999, padding: "3px 10px", cursor: "pointer",
              border: t === type ? "2px solid var(--kh-ink-300)" : "1px solid transparent",
              background: POST_TONE[t]?.bg ?? "var(--kh-ink-50)", color: POST_TONE[t]?.color ?? "var(--kh-ink-600)",
            }}
          >
            {t}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={submit} disabled={saving || !body.trim()} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", border: "none", borderRadius: 8, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}>
          {saving && <Spinner size="sm" />}
          {saving ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  )
}

function PostCard({
  post,
  isMine,
  classId,
  onUpdated,
  onDeleted,
}: {
  post: ClassHubPostWithAuthor
  isMine: boolean
  classId: string
  onUpdated: (p: ClassHubPostWithAuthor) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(post.body)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const tone = POST_TONE[post.post_type] ?? { bg: "var(--kh-ink-50)", color: "var(--kh-ink-600)" }

  async function saveEdit() {
    if (!body.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/hub/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      })
      if (res.ok) {
        const updated: ClassHubPostWithAuthor = await res.json()
        onUpdated(updated)
        setEditing(false)
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Failed to save changes.")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/classes/${classId}/hub/posts/${post.id}`, { method: "DELETE" })
      if (res.ok) onDeleted(post.id)
      else setError("Failed to delete post.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="kh-card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
          {(post.author_name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{post.author_name ?? "Unknown"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: tone.color, background: tone.bg, borderRadius: 999, padding: "2px 8px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.color }} /> {post.post_type}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{relativeTime(post.created_at)}</span>
        {isMine && !editing && (
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => { setEditing(true); setBody(post.body) }} title="Edit post" style={{ background: "none", border: "none", color: "var(--kh-ink-400)", cursor: "pointer", display: "flex" }}>
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete} disabled={deleting} title="Delete post" style={{ background: "none", border: "none", color: "var(--kh-ink-400)", cursor: deleting ? "not-allowed" : "pointer", display: "flex" }}>
              {deleting ? <Spinner size="sm" /> : <Trash2 size={12} />}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            style={{ width: "100%", border: "1px solid var(--kh-border)", borderRadius: 10, padding: "10px 12px", fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => { setEditing(false); setBody(post.body); setError("") }} style={{ fontSize: 12, padding: "5px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "none", cursor: "pointer", color: "var(--kh-ink-600)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <X size={12} /> Cancel
            </button>
            <button onClick={saveEdit} disabled={saving || !body.trim()} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 7, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 5 }}>
              {saving ? <Spinner size="sm" /> : <Check size={12} />} {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--kh-ink-800)", lineHeight: 1.6, marginTop: 9 }}>{post.body}</div>
      )}

      {error && <div style={{ fontSize: 11.5, color: "#C0392B", marginTop: 6 }}>{error}</div>}
    </div>
  )
}

function AddRuleRow({ classId, onAdded }: { classId: string; onAdded: (r: ClassRule) => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/classes/${classId}/hub/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule_text: text.trim(), sort_order: Date.now() }),
      })
      if (res.ok) {
        const rule: ClassRule = await res.json()
        onAdded(rule)
        setText("")
        setOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--kh-ink-50)", fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", background: "none", border: "none", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--kh-ink-50)", cursor: "pointer", width: "100%", textAlign: "left" }}>
        <Plus size={12} /> Add rule
      </button>
    )
  }

  return (
    <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--kh-ink-50)" }}>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Rule text…" style={{ flex: 1, border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, outline: "none" }} />
      <button onClick={submit} disabled={saving || !text.trim()} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 7, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, display: "inline-flex", alignItems: "center" }}>
        {saving ? <Spinner size="sm" /> : "Add"}
      </button>
    </div>
  )
}

function AddEventForm({ classId, onAdded }: { classId: string; onAdded: (e: ClassEvent) => void }) {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (!title.trim() || !startsAt) { setError("Title and start date/time are required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/hub/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), location: location.trim() || null, starts_at: new Date(startsAt).toISOString() }),
      })
      if (res.ok) {
        const event: ClassEvent = await res.json()
        onAdded(event)
        setTitle("")
        setLocation("")
        setStartsAt("")
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Failed to add event.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="kh-card" style={{ background: "var(--kh-bg)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>New event</span>
      </div>
      <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, outline: "none" }} />
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, outline: "none" }} />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, outline: "none" }} />
        {error && <span style={{ fontSize: 11.5, color: "#C0392B" }}>{error}</span>}
        <button onClick={submit} disabled={saving} style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", border: "none", borderRadius: 8, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}>
          {saving && <Spinner size="sm" />}
          {saving ? "Publishing…" : "Publish to hub"}
        </button>
      </div>
    </div>
  )
}

export default function HubTab({ classId }: { classId: string }) {
  const [posts, setPosts] = useState<ClassHubPostWithAuthor[] | null>(null)
  const [rules, setRules] = useState<ClassRule[]>([])
  const [events, setEvents] = useState<ClassEvent[]>([])
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    Promise.all([
      fetch(`/api/classes/${classId}/hub/posts`).then((r) => r.json()),
      fetch(`/api/classes/${classId}/hub/rules`).then((r) => r.json()),
      fetch(`/api/classes/${classId}/hub/events`).then((r) => r.json()),
      fetch(`/api/auth/me`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([postsData, rulesData, eventsData, me]) => {
      setPosts(Array.isArray(postsData) ? postsData : [])
      setRules(Array.isArray(rulesData) ? rulesData : [])
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setMyUserId(me?.sub ?? null)
    })
  }, [classId, loaded])

  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null)

  async function deleteRule(id: string) {
    setDeletingRuleId(id)
    try {
      const res = await fetch(`/api/classes/${classId}/hub/rules/${id}`, { method: "DELETE" })
      if (res.ok) setRules((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setDeletingRuleId(null)
    }
  }

  if (posts === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
        <Spinner size="md" />
        Loading…
      </div>
    )
  }

  return (
    <div className="kh-tab-split-grid">
      {/* LEFT — composer + feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Composer classId={classId} onPosted={(p) => setPosts((prev) => [p, ...(prev ?? [])])} />

        {posts.length === 0 ? (
          <div className="kh-card" style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
            No posts yet — share the first update with class parents.
          </div>
        ) : (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              isMine={myUserId !== null && p.author_id === myUserId}
              classId={classId}
              onUpdated={(updated) => setPosts((prev) => (prev ?? []).map((x) => (x.id === updated.id ? updated : x)))}
              onDeleted={(id) => setPosts((prev) => (prev ?? []).filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>

      {/* RIGHT — rules + events */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="kh-card" style={{ borderColor: "var(--kh-peach-l)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)" }}>
            <Pin size={14} style={{ color: "var(--kh-peach)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Class rules</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--kh-ink-400)" }}>pinned</span>
          </div>
          <div style={{ padding: "2px 16px 14px" }}>
            {rules.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", padding: "12px 0" }}>No rules pinned yet.</p>
            ) : (
              rules.map((r, i) => (
                <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                  <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-peach-d)", fontWeight: 600, marginTop: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ flex: 1, fontSize: 12.5, color: "var(--kh-ink-800)", lineHeight: 1.5 }}>{r.rule_text}</div>
                  <button onClick={() => deleteRule(r.id)} disabled={deletingRuleId === r.id} style={{ background: "none", border: "none", color: "var(--kh-ink-300)", cursor: deletingRuleId === r.id ? "not-allowed" : "pointer", display: "flex" }}>
                    {deletingRuleId === r.id ? <Spinner size="sm" /> : <Trash2 size={12} />}
                  </button>
                </div>
              ))
            )}
            <AddRuleRow classId={classId} onAdded={(r) => setRules((prev) => [...prev, r])} />
          </div>
        </div>

        <div className="kh-card">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Class events</span>
          </div>
          <div style={{ padding: "2px 16px 14px" }}>
            {events.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", padding: "12px 0" }}>No upcoming events.</p>
            ) : (
              events.map((e, i) => {
                const d = new Date(e.starts_at)
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                    <div style={{ width: 44, textAlign: "center", padding: "6px 0", borderRadius: 10, background: "var(--kh-peach-bg)", border: "1px solid var(--kh-peach-l)" }}>
                      <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 17, color: "var(--kh-ink-900)", lineHeight: 1 }}>{d.getDate().toString().padStart(2, "0")}</div>
                      <div style={{ fontSize: 9.5, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-500)", textTransform: "uppercase", letterSpacing: ".08em" }}>{d.toLocaleDateString("en-US", { month: "short" })}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>
                        {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}{e.location ? ` · ${e.location}` : ""}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <AddEventForm classId={classId} onAdded={(e) => setEvents((prev) => [...prev, e].sort((a, b) => a.starts_at.localeCompare(b.starts_at)))} />
      </div>
    </div>
  )
}
