"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, BookOpen, Baby, Loader2 } from "lucide-react"

type SearchFamilyResult = { id: string; name: string; status: string }
type SearchClassResult = { id: string; name: string }
type SearchKidResult = { id: string; firstname: string; lastname: string; family_id: string; family_name: string | null }
type SearchResults = { families: SearchFamilyResult[]; classes: SearchClassResult[]; kids: SearchKidResult[] }

const EMPTY: SearchResults = { families: [], classes: [], kids: [] }

export default function GlobalSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults(EMPTY)
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : EMPTY))
        .then((data: SearchResults) => setResults(data))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function goTo(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const hasResults = results.families.length > 0 || results.classes.length > 0 || results.kids.length > 0
  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 420 }}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--kh-ink-400)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search families, classes, kids…"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "7px 12px 7px 32px", borderRadius: 999,
            border: "1px solid var(--kh-border)", background: "var(--kh-bg)",
            fontSize: 13, outline: "none", color: "var(--kh-ink-800)",
          }}
        />
        {loading && (
          <Loader2 size={13} className="kh-spin" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--kh-ink-400)" }} />
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 80,
          background: "var(--kh-surface)", border: "1px solid var(--kh-border)", borderRadius: "var(--kh-radius)",
          boxShadow: "var(--kh-shadow-md)", maxHeight: 420, overflowY: "auto", padding: "6px 0",
        }}>
          {!loading && !hasResults && (
            <div style={{ padding: "16px 14px", fontSize: 12.5, color: "var(--kh-ink-400)", textAlign: "center" }}>
              No results for &ldquo;{query.trim()}&rdquo;
            </div>
          )}

          {results.families.length > 0 && (
            <div>
              <div className="kh-search-section-label"><Users size={11} /> Families</div>
              {results.families.map((f) => (
                <button key={f.id} className="kh-search-item" onClick={() => goTo(`/dashboard/families/${f.id}`)}>
                  <span className="kh-search-item-title">{f.name}</span>
                  <span className="kh-search-item-sub">{f.status}</span>
                </button>
              ))}
            </div>
          )}

          {results.classes.length > 0 && (
            <div>
              <div className="kh-search-section-label"><BookOpen size={11} /> Classes</div>
              {results.classes.map((c) => (
                <button key={c.id} className="kh-search-item" onClick={() => goTo(`/dashboard/classes/${c.id}`)}>
                  <span className="kh-search-item-title">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {results.kids.length > 0 && (
            <div>
              <div className="kh-search-section-label"><Baby size={11} /> Kids</div>
              {results.kids.map((k) => (
                <button key={k.id} className="kh-search-item" onClick={() => goTo(`/dashboard/families/${k.family_id}`)}>
                  <span className="kh-search-item-title">{k.firstname} {k.lastname}</span>
                  {k.family_name && <span className="kh-search-item-sub">{k.family_name}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
