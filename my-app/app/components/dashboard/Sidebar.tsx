"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Building2,
  BarChart2,
  Settings,
  ChevronRight,
  GraduationCap,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard",       icon: Home,      label: "Overview"  },
  { href: "/dashboard/users", icon: Users,     label: "Users"     },
  { href: "/dashboard/teams", icon: Building2, label: "Teams"     },
  { href: "/dashboard/reports",icon: BarChart2, label: "Reports"  },
  { href: "/dashboard/settings",icon: Settings, label: "Settings" },
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full z-50
        flex flex-col
        bg-white border-r border-white/5
        transition-all duration-300 ease-in-out
        ${expanded ? "w-56" : "w-16"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/5 overflow-hidden shrink-0">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <GraduationCap size={16} className="text-white" />
        </div>
        <span
          className={`
            ml-3 font-bold text-white text-sm whitespace-nowrap
            transition-all duration-200
            ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"}
          `}
        >
          KinderHub
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={`
                group flex items-center gap-3 px-2 py-2.5 rounded-xl
                transition-all duration-150 relative
                ${active
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full" />
              )}
              <Icon size={18} className="shrink-0" />
              <span
                className={`
                  text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none w-0"}
                `}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-center h-12 border-t border-white/5 text-gray-600 hover:text-gray-600 hover:bg-white/5 transition-colors shrink-0"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronRight
          size={15}
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    </aside>
  )
}
