import { Spinner } from "@/components/ui/Spinner"

export function PageLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 320 }}>
      <Spinner size="lg" />
    </div>
  )
}
