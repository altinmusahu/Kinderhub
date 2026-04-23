import KindergartenSceneLoader from "@/app/components/dashboard/KindergartenSceneLoader"
import Header from "./components/Header"

export default function OverviewPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* <Header /> */}
      <div className="flex-1 relative">
        <KindergartenSceneLoader />
      </div>
    </div>
  )
}
