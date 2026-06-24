export const AVATAR_COLORS = [
  "#F87171",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#A78BFA",
  "#F472B6",
]

export function avatarColor(id: string) {
  let n = 0
  for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

export function initials(name: string, lastname: string) {
  return `${name?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase()
}