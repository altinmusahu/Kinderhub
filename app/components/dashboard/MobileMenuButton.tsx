"use client"

import { Menu } from "lucide-react"
import { useMobileNav } from "./MobileNavContext"

export default function MobileMenuButton() {
  const { openMobileNav } = useMobileNav()
  return (
    <button
      className="kh-hamburger"
      onClick={openMobileNav}
      aria-label="Open navigation"
    >
      <Menu size={17} />
    </button>
  )
}
