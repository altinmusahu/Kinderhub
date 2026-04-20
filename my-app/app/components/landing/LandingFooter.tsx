import type { Messages } from "@/lib/i18n"

type FooterProps = {
  t: Messages["footer"]
}

export default function LandingFooter({ t }: FooterProps) {
  return (
    <footer className="border-t border-gray-100 py-8 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
      <span className="font-bold text-gray-600 text-base">KinderHub</span>
      <span>© {new Date().getFullYear()} {t.rights}</span>
    </footer>
  )
}
