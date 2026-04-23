import KindergartenSceneLoader from "@/app/components/dashboard/KindergartenSceneLoader"

export default function OverviewPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-end justify-between border-b bg-white border-white/5">
        <div>
          <p className="text-black/35 text-xs tracking-widest uppercase mb-0.5">Dashboard</p>
          <h1 className="text-lg font-bold text-black">Overview</h1>
        </div>
        <p className="text-white/25 text-xs pb-0.5">Explore your kindergarten below</p>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative">
        <KindergartenSceneLoader />
      </div>
    </div>
  )
}
