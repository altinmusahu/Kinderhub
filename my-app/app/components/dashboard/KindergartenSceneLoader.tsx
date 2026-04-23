"use client"

import dynamic from "next/dynamic"

const KindergartenScene = dynamic(
  () => import("./KindergartenScene"),
  { ssr: false }
)

export default function KindergartenSceneLoader() {
  return <KindergartenScene />
}
