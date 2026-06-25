import Link from "next/link"
import { Mail, ClipboardList, MoreHorizontal, MapPin, Clock, User, Heart } from "lucide-react"

// ── Dummy data (screen 04b · Sunbeam) ─────────────────────────

const CLASS_DETAIL = {
  id: "cls-0142",
  name: "Sunbeam",
  ageRange: "3–5 yr",
  status: "Open",
  location: "House 2 · Room A",
  schedule: "Mon–Fri · 8:00–17:30",
  lead: "Priya Raghavan",
  capacity: 16,
  enrolled: 14,
  tone: "peach",
}

const ROSTER = [
  { name: "Ines Okafor-Lind",  age: "4y 2m", since: "Sep 2023", att: 0.96, status: "Present", allergy: "Peanuts",   guardian: "Amara Okafor"   },
  { name: "Nika Volkov",        age: "4y 7m", since: "Oct 2023", att: 0.94, status: "Present", allergy: null,        guardian: "Irina Volkov"    },
  { name: "Wren Brunner",       age: "4y 1m", since: "Jan 2024", att: 0.91, status: "Present", allergy: null,        guardian: "Eliot Brunner"   },
  { name: "Sasha Doyle",        age: "3y 9m", since: "Nov 2023", att: 0.89, status: "Late",    allergy: "Dairy",     guardian: "Mara Doyle"      },
  { name: "Felix Andersson",    age: "4y 5m", since: "Aug 2023", att: 0.97, status: "Present", allergy: null,        guardian: "Erik Andersson"  },
  { name: "Priya Nair",         age: "3y 11m",since: "Feb 2024", att: 0.93, status: "Present", allergy: "Eggs",      guardian: "Anjali Nair"     },
  { name: "Theo Bianchi",       age: "4y 0m", since: "Sep 2023", att: 0.90, status: "Absent",  allergy: null,        guardian: "Lucia Bianchi"   },
  { name: "Maya Osei",          age: "3y 8m", since: "Mar 2024", att: 0.88, status: "Present", allergy: null,        guardian: "Akosua Osei"     },
  { name: "Liam Schwartz",      age: "4y 3m", since: "Oct 2023", att: 0.95, status: "Present", allergy: null,        guardian: "Dana Schwartz"   },
  { name: "Aria Petrov",        age: "4y 6m", since: "Jul 2023", att: 0.92, status: "Present", allergy: "Tree nuts", guardian: "Mila Petrov"     },
  { name: "Noah Kim",           age: "3y 10m",since: "Jan 2024", att: 0.91, status: "Present", allergy: null,        guardian: "Grace Kim"       },
  { name: "Elsa Moreau",        age: "4y 1m", since: "Nov 2023", att: 0.96, status: "Present", allergy: null,        guardian: "Camille Moreau"  },
  { name: "Hugo Fischer",       age: "3y 7m", since: "Apr 2024", att: 0.87, status: "Present", allergy: null,        guardian: "Lena Fischer"    },
  { name: "Zara Hassan",        age: "4y 4m", since: "Sep 2023", att: 0.94, status: "Present", allergy: null,        guardian: "Yusuf Hassan"    },
]

const ROUTINE = [
  { time: "8:00",  label: "Arrival & free play",  color: "var(--kh-peach)"    },
  { time: "9:00",  label: "Morning circle",        color: "var(--kh-peach)"    },
  { time: "9:30",  label: "Outdoor — garden",      color: "var(--kh-sage)"     },
  { time: "11:00", label: "Learning centers",      color: "var(--kh-marigold)" },
  { time: "12:00", label: "Lunch",                 color: "var(--kh-marigold)" },
  { time: "13:00", label: "Nap & quiet time",      color: "var(--kh-pink)"     },
  { time: "15:00", label: "Snack & story",         color: "var(--kh-peach)"    },
  { time: "16:00", label: "Outdoor & pickup",      color: "var(--kh-sage)"     },
]

const STAFF = [
  { name: "Priya Raghavan",  role: "Lead",        avatarBg: "var(--kh-peach-l)", avatarColor: "var(--kh-peach-d)" },
  { name: "Devon Maleki",    role: "Assistant",   avatarBg: "var(--kh-sage-l)",  avatarColor: "var(--kh-sage-d)"  },
  { name: "Joaquín Ribeiro", role: "Floater · AM",avatarBg: "var(--kh-marigold-l)", avatarColor: "var(--kh-marigold)" },
]

const WAITLIST = [
  { rank: "#1", name: "Sora Yamazaki", age: "2y 1m", note: "Ages up Jul · tour booked" },
  { rank: "#2", name: "Nour Habibi",   age: "1y 5m", note: "Sibling priority"           },
  { rank: "#3", name: "Caleb Mensah",  age: "3y 2m", note: "Applied Apr 14"             },
]

// ── Helpers ───────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

function statusStyle(s: string): { bg: string; color: string; dot: string } {
  if (s === "Present") return { bg: "var(--kh-sage-bg)",     color: "var(--kh-sage-d)",     dot: "var(--kh-sage)"     }
  if (s === "Late")    return { bg: "var(--kh-marigold-bg)", color: "var(--kh-marigold-d)", dot: "var(--kh-marigold)" }
  if (s === "Absent")  return { bg: "var(--kh-ink-50)",      color: "var(--kh-ink-600)",    dot: "var(--kh-ink-400)"  }
  return { bg: "var(--kh-ink-50)", color: "var(--kh-ink-500)", dot: "var(--kh-ink-300)" }
}

function Pill({ text, bg, color, dot }: { text: string; bg: string; color: string; dot?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 999,
      background: bg, color, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      {text}
    </span>
  )
}

function Avatar({ name, bg, color, size = 28 }: { name: string; bg: string; color: string; size?: number }) {
  const r = Math.round(size * 0.3)
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: r,
      background: bg, color, fontSize: size * 0.38, fontWeight: 700,
      flexShrink: 0,
    }}>
      {initials(name)}
    </span>
  )
}

// ── KPI circle ─────────────────────────────────────────────────

const CIRCUMFERENCE = 2 * Math.PI * 24

function CapacityRing({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const arc = CIRCUMFERENCE * (enrolled / capacity)
  return (
    <div style={{ display: "flex", gap: 14, padding: "12px 18px", background: "var(--kh-surface)", border: "1px solid var(--kh-ink-100)", borderRadius: 14, boxShadow: "var(--kh-shadow-sm)", alignItems: "center" }}>
      <div style={{ position: "relative", width: 58, height: 58 }}>
        <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="29" cy="29" r="24" fill="none" stroke="var(--kh-ink-100)" strokeWidth="7" />
          <circle cx="29" cy="29" r="24" fill="none" stroke="var(--kh-peach)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 15, fontWeight: 600, color: "var(--kh-ink-900)" }}>{enrolled}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Enrolled</div>
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, color: "var(--kh-ink-900)", lineHeight: 1 }}>{enrolled} / {capacity}</div>
        <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{capacity - enrolled} spot{capacity - enrolled !== 1 ? "s" : ""} open</div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const present = ROSTER.filter(r => r.status === "Present").length
  const late    = ROSTER.filter(r => r.status === "Late").length
  const absent  = ROSTER.filter(r => r.status === "Absent").length
  const allergies = ROSTER.filter(r => r.allergy)

  const TABS = ["Roster", "Schedule", "Attendance", "Curriculum", "Documents"]

  return (
    <div className="kh-page" style={{ padding: 0 }}>

      {/* Topbar */}
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <Link href="/dashboard/classes" className="kh-breadcrumb-parent" style={{ textDecoration: "none" }}>Classes</Link>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">{CLASS_DETAIL.name}</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
            <Mail size={13} /> Message room
          </button>
          <button className="kh-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
            <ClipboardList size={13} /> Take attendance
          </button>
          <button className="kh-btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, padding: 0 }}>
            <MoreHorizontal size={14} />
          </button>
        </div>
      </header>

      {/* Hero / class header */}
      <div style={{
        padding: "22px 26px 0",
        background: "linear-gradient(180deg, var(--kh-peach-bg) 0%, transparent 78%)",
        borderBottom: "1px solid var(--kh-ink-100)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 16 }}>

          {/* Class icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18, flexShrink: 0,
            background: "linear-gradient(150deg, var(--kh-peach-l), var(--kh-peach))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--kh-shadow-md)",
          }}>
            <span style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "#fff" }}>
              {CLASS_DETAIL.name[0]}
            </span>
          </div>

          {/* Name + pills + meta */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontFamily: "var(--kh-font-serif)", fontSize: 30, fontWeight: 400, color: "var(--kh-ink-900)", letterSpacing: "-0.015em" }}>
                {CLASS_DETAIL.name}
              </h1>
              <Pill text={CLASS_DETAIL.ageRange} bg="var(--kh-peach-bg)" color="var(--kh-peach-d)" />
              <Pill text="Open" bg="var(--kh-sage-bg)" color="var(--kh-sage-d)" dot="var(--kh-sage)" />
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12.5, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={12} /> {CLASS_DETAIL.location}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Clock size={12} /> {CLASS_DETAIL.schedule}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <User size={12} /> Lead {CLASS_DETAIL.lead}
              </span>
              <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12 }}>{CLASS_DETAIL.id}</span>
            </div>
          </div>

          <CapacityRing enrolled={CLASS_DETAIL.enrolled} capacity={CLASS_DETAIL.capacity} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 18 }}>
          {TABS.map((tab, i) => (
            <div key={tab} style={{
              padding: "8px 2px",
              fontSize: 13,
              color: i === 0 ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
              fontWeight: i === 0 ? 600 : 500,
              borderBottom: i === 0 ? "2px solid var(--kh-peach)" : "2px solid transparent",
              cursor: "pointer",
            }}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 26px 40px", overflowY: "auto" }}>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { label: "Present now",       value: present,       sub: `${late} late · ${absent} absent` },
            { label: "Staff : child ratio",value: "1 : 5",      sub: "meets 1:8 required", ok: true   },
            { label: "Avg attendance",     value: "93%",         sub: "last 30 days"                   },
            { label: "Waitlist",           value: WAITLIST.length, sub: "next ages up Jul"             },
          ].map((k, i) => (
            <div key={i} className="kh-card" style={{ padding: "13px 16px" }}>
              <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>{k.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 5 }}>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)" }}>{k.value}</div>
                {k.ok && <Pill text="OK" bg="var(--kh-sage-bg)" color="var(--kh-sage-d)" dot="var(--kh-sage)" />}
              </div>
              <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 14, alignItems: "start" }}>

          {/* LEFT: roster + routine */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Roster */}
            <div className="kh-card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Roster</span>
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
                  {ROSTER.length} children
                </span>
                <button className="kh-btn" style={{
                  marginLeft: "auto", padding: "5px 10px", fontSize: 11.5,
                  background: "var(--kh-peach)", color: "#fff",
                  border: "1px solid var(--kh-peach-d)", borderRadius: 8,
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  + Add child
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr>
                    {["Child", "Age", "Today", "Attendance", "Allergy", ""].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i === 3 ? "right" : "left",
                        fontWeight: 500, color: "var(--kh-ink-400)",
                        fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                        padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-100)",
                        fontFamily: "var(--kh-font-mono)",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROSTER.map((r, i) => {
                    const ss = statusStyle(r.status)
                    return (
                      <tr key={i} style={{ cursor: "pointer" }}>
                        <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={r.name} bg="var(--kh-peach-bg)" color="var(--kh-peach-d)" size={28} />
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--kh-ink-900)" }}>{r.name}</div>
                              <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{r.guardian}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)", verticalAlign: "middle" }}>
                          {r.age}
                        </td>
                        <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle" }}>
                          <Pill text={r.status} bg={ss.bg} color={ss.color} dot={ss.dot} />
                        </td>
                        <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", textAlign: "right", fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-700)", verticalAlign: "middle" }}>
                          {Math.round(r.att * 100)}%
                        </td>
                        <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle" }}>
                          {r.allergy
                            ? <Pill text={r.allergy} bg="var(--kh-pink-bg)" color="var(--kh-pink-d)" dot="var(--kh-pink)" />
                            : <span style={{ color: "var(--kh-ink-300)", fontSize: 12 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", width: 54, verticalAlign: "middle" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", color: "var(--kh-ink-400)" }}>
                            <span title="Open" style={{ cursor: "pointer" }}>›</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--kh-ink-50)", fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
                + Drag a child here from another room to transfer
              </div>
            </div>

            {/* Daily routine */}
            <div className="kh-card">
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Daily routine</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>Mon–Fri</span>
              </div>
              <div style={{ padding: "6px 16px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
                {ROUTINE.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, alignItems: "center",
                    padding: "9px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)",
                  }}>
                    <div style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-500)", width: 42 }}>{r.time}</div>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, color: "var(--kh-ink-800)" }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: allergies + staff + waitlist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Allergy & medical */}
            <div className="kh-card" style={{ borderColor: "var(--kh-pink-l)" }}>
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={14} style={{ color: "var(--kh-pink)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Allergy &amp; medical</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{allergies.length} flagged</span>
              </div>
              <div style={{ padding: "2px 14px 14px" }}>
                {allergies.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", borderTop: "1px solid var(--kh-ink-50)",
                  }}>
                    <Avatar name={r.name} bg="var(--kh-peach-bg)" color="var(--kh-peach-d)" size={22} />
                    <div style={{ flex: 1, fontSize: 12.5, color: "var(--kh-ink-800)" }}>{r.name}</div>
                    <Pill text={r.allergy!} bg="var(--kh-pink-bg)" color="var(--kh-pink-d)" dot="var(--kh-pink)" />
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 10, lineHeight: 1.5 }}>
                  Shared with kitchen daily. Ines carries an EpiPen — stored in the room cabinet.
                </div>
              </div>
            </div>

            {/* Staff today */}
            <div className="kh-card">
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Staff today</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>ratio 1:5</span>
              </div>
              <div style={{ padding: "2px 14px 14px" }}>
                {STAFF.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)",
                  }}>
                    <Avatar name={s.name} bg={s.avatarBg} color={s.avatarColor} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{s.role}</div>
                    </div>
                    <Pill text="On shift" bg="var(--kh-sage-bg)" color="var(--kh-sage-d)" dot="var(--kh-sage)" />
                  </div>
                ))}
              </div>
            </div>

            {/* Waitlist */}
            <div className="kh-card">
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Waitlist</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{WAITLIST.length} waiting</span>
              </div>
              <div style={{ padding: "2px 14px 14px" }}>
                {WAITLIST.map((w, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)",
                  }}>
                    <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)", width: 18 }}>{w.rank}</span>
                    <Avatar name={w.name} bg="var(--kh-peach-bg)" color="var(--kh-peach-d)" size={22} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{w.age} · {w.note}</div>
                    </div>
                    <button className="kh-btn" style={{ padding: "4px 9px", fontSize: 11.5 }}>Enroll</button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
