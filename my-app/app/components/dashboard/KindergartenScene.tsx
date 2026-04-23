"use client"

import { Suspense, useRef, useState, useCallback, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, Sky, Environment, OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"

// ─── Roof constants ───────────────────────────────────────────────────────────

const WALL_TOP    = 1.5
const RIDGE_H     = 1.65
const PANEL_HALF_D = 2.3            // ridge → eave distance (includes overhang)
const PANEL_SLOPE = Math.sqrt(PANEL_HALF_D ** 2 + RIDGE_H ** 2)   // ≈ 2.83
const PANEL_ANGLE = Math.atan2(RIDGE_H, PANEL_HALF_D)             // ≈ 35.6°
const PANEL_W     = 4.8             // roof width (wider than walls = side overhang)
const ROOF_COLOR  = "#9B3520"

// ─── Gable triangle (fills end-wall triangle above wall top) ─────────────────

function GableTriangle({ x }: { x: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const y0 = WALL_TOP, y1 = WALL_TOP + RIDGE_H
    const v = new Float32Array([
      x, y0, -2.0,
      x, y0,  2.0,
      x, y1,  0.0,
    ])
    g.setAttribute("position", new THREE.BufferAttribute(v, 3))
    g.setIndex(x > 0 ? [0, 2, 1] : [0, 1, 2])
    g.computeVertexNormals()
    return g
  }, [x])

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#EDE8DC" roughness={0.82} />
    </mesh>
  )
}

// ─── Gable roof assembly ──────────────────────────────────────────────────────

function GableRoof() {
  return (
    <group>
      {/* Front slope (tilts: eave at z=+2.3, ridge at z=0) */}
      <mesh
        position={[0, WALL_TOP + RIDGE_H / 2, PANEL_HALF_D / 2]}
        rotation={[PANEL_ANGLE, 0, 0]}
        castShadow receiveShadow
      >
        <boxGeometry args={[PANEL_W, 0.10, PANEL_SLOPE]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={0.88} metalness={0.02} />
      </mesh>

      {/* Back slope */}
      <mesh
        position={[0, WALL_TOP + RIDGE_H / 2, -PANEL_HALF_D / 2]}
        rotation={[-PANEL_ANGLE, 0, 0]}
        castShadow receiveShadow
      >
        <boxGeometry args={[PANEL_W, 0.10, PANEL_SLOPE]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={0.88} metalness={0.02} />
      </mesh>

      {/* Ridge cap */}
      <mesh position={[0, WALL_TOP + RIDGE_H + 0.07, 0]} castShadow>
        <boxGeometry args={[PANEL_W + 0.12, 0.14, 0.24]} />
        <meshStandardMaterial color="#7A2215" roughness={0.9} />
      </mesh>

      {/* Eave fascia boards */}
      {([1, -1] as const).map((sign) => (
        <mesh key={sign} position={[0, WALL_TOP - 0.07, sign * (PANEL_HALF_D + 0.02)]}>
          <boxGeometry args={[PANEL_W + 0.12, 0.18, 0.1]} />
          <meshStandardMaterial color="#F8F4EE" roughness={0.68} />
        </mesh>
      ))}

      {/* Gable end fills */}
      <GableTriangle x={ 2.1} />
      <GableTriangle x={-2.1} />
    </group>
  )
}

// ─── Window unit (frame + glass + shutters + sill + optional flower box) ─────

function WindowUnit({
  position,
  showFlowerBox = false,
}: {
  position: [number, number, number]
  showFlowerBox?: boolean
}) {
  const FLOWER_COLORS = ["#FF4D6D", "#FFD60A", "#FF9F1C"]
  return (
    <group position={position}>
      {/* Outer frame */}
      <mesh>
        <boxGeometry args={[1.06, 1.06, 0.07]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.62} />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.80, 0.80, 0.04]} />
        <meshStandardMaterial
          color="#C8E8F8"
          transparent
          opacity={0.50}
          roughness={0.02}
          metalness={0.65}
          envMapIntensity={2}
        />
      </mesh>

      {/* Glazing bars */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.05, 0.80, 0.03]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.80, 0.05, 0.03]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>

      {/* Green shutters (open/pushed aside) */}
      {([-0.74, 0.74] as const).map((ox) => (
        <mesh key={ox} position={[ox, 0, 0.03]}>
          <boxGeometry args={[0.38, 1.0, 0.04]} />
          <meshStandardMaterial color="#2D5A27" roughness={0.84} />
        </mesh>
      ))}

      {/* Window sill */}
      <mesh position={[0, -0.59, 0.14]}>
        <boxGeometry args={[1.32, 0.08, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.65} />
      </mesh>

      {showFlowerBox && (
        <group position={[0, -0.80, 0.17]}>
          {/* Box */}
          <mesh>
            <boxGeometry args={[0.9, 0.22, 0.22]} />
            <meshStandardMaterial color="#A0522D" roughness={0.88} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.82, 0.06, 0.18]} />
            <meshStandardMaterial color="#2D1A08" roughness={1} />
          </mesh>
          {/* Flowers */}
          {([-0.3, 0, 0.3] as const).map((fx, fi) => (
            <mesh key={fi} position={[fx, 0.26, 0]}>
              <icosahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial
                color={FLOWER_COLORS[fi]}
                roughness={0.9}
                emissive={FLOWER_COLORS[fi]}
                emissiveIntensity={0.12}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// ─── Tree ────────────────────────────────────────────────────────────────────

function Tree({
  position,
  scale = 1,
  leafColor = "#3A7A30",
}: {
  position: [number, number, number]
  scale?: number
  leafColor?: string
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.20, 0.30, 1.7, 7]} />
        <meshStandardMaterial color="#6D4C35" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 1.7, 0]}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color={leafColor} roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[-0.35, 1.25, 0.25]}>
        <icosahedronGeometry args={[0.60, 1]} />
        <meshStandardMaterial color="#2D6625" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0.30, 1.35, -0.20]}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#347A2A" roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

// ─── Chimney ─────────────────────────────────────────────────────────────────

function Chimney({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.55, 2.2, 0.55]} />
        <meshStandardMaterial color="#8B3A28" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.14, 0]}>
        <boxGeometry args={[0.72, 0.13, 0.72]} />
        <meshStandardMaterial color="#6A2A1A" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.30, 0]}>
        <cylinderGeometry args={[0.13, 0.17, 0.28, 7]} />
        <meshStandardMaterial color="#4A1A0E" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── House ───────────────────────────────────────────────────────────────────

const PATH_STONES = [
  { x:  0.00, z: 3.5, ry:  0.10 },
  { x:  0.12, z: 4.1, ry: -0.12 },
  { x: -0.10, z: 4.7, ry:  0.06 },
  { x:  0.05, z: 5.3, ry:  0.14 },
  { x:  0.10, z: 5.9, ry: -0.08 },
]

function House({ onEnter }: { onEnter: () => void }) {
  const [hovered, setHovered] = useState(false)

  const enter   = useCallback((e: { stopPropagation: () => void }) => { e.stopPropagation(); onEnter() }, [onEnter])
  const over    = useCallback(() => { setHovered(true);  document.body.style.cursor = "pointer"  }, [])
  const out     = useCallback(() => { setHovered(false); document.body.style.cursor = "default"  }, [])
  useEffect(() => () => { document.body.style.cursor = "default" }, [])

  return (
    <group onClick={enter} onPointerEnter={over} onPointerLeave={out}>

      {/* ── Foundation slab ── */}
      <mesh position={[0, -1.68, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.25, 4.5]} />
        <meshStandardMaterial color="#C8BAA0" roughness={0.94} />
      </mesh>

      {/* ── Walls ── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 3.0, 4.0]} />
        <meshStandardMaterial
          color={hovered ? "#F5EDD8" : "#EDE8DC"}
          roughness={0.82}
        />
      </mesh>

      {/* ── Roof ── */}
      <GableRoof />

      {/* ── Chimney (peeks above roof) ── */}
      <Chimney position={[1.1, 2.9, -0.5]} />

      {/* ── Door frame ── */}
      <mesh position={[0, -0.38, 2.01]} castShadow>
        <boxGeometry args={[1.22, 2.12, 0.08]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.65} />
      </mesh>

      {/* ── Door leaf ── */}
      <mesh position={[0, -0.44, 2.06]} castShadow>
        <boxGeometry args={[0.98, 1.92, 0.06]} />
        <meshStandardMaterial color={hovered ? "#9B6A2A" : "#7B4D26"} roughness={0.74} />
      </mesh>

      {/* Door raised panels */}
      {([-0.82, 0.08] as const).map((py) => (
        <mesh key={py} position={[0, py, 2.10]}>
          <boxGeometry args={[0.72, 0.62, 0.04]} />
          <meshStandardMaterial color={hovered ? "#8A5E24" : "#6A4020"} roughness={0.77} />
        </mesh>
      ))}

      {/* Door handle */}
      <mesh position={[0.36, -0.55, 2.11]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color="#D4A017" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Fanlight above door */}
      <mesh position={[0, 0.62, 2.08]}>
        <boxGeometry args={[0.82, 0.36, 0.04]} />
        <meshStandardMaterial color="#C8E8F8" transparent opacity={0.5} roughness={0.02} metalness={0.65} />
      </mesh>

      {/* ── Front windows ── */}
      <WindowUnit position={[-1.32, 0.55, 2.05]} showFlowerBox />
      <WindowUnit position={[ 1.32, 0.55, 2.05]} showFlowerBox />

      {/* ── Back window ── */}
      <WindowUnit position={[0, 0.55, -2.05]} />

      {/* ── Porch steps ── */}
      <mesh position={[0, -1.52, 2.62]} receiveShadow>
        <boxGeometry args={[1.56, 0.16, 0.70]} />
        <meshStandardMaterial color="#BEBEBE" roughness={0.92} />
      </mesh>
      <mesh position={[0, -1.63, 3.20]} receiveShadow>
        <boxGeometry args={[1.76, 0.12, 0.58]} />
        <meshStandardMaterial color="#C8C8C8" roughness={0.92} />
      </mesh>

      {/* ── Garden path ── */}
      {PATH_STONES.map(({ x, z, ry }) => (
        <mesh key={z} position={[x, -1.645, z]} rotation={[0, ry, 0]} receiveShadow>
          <boxGeometry args={[0.55, 0.05, 0.50]} />
          <meshStandardMaterial color="#D0C8B8" roughness={0.98} />
        </mesh>
      ))}

      {/* ── Trees ── */}
      <Tree position={[-4.0, -0.5,  1.0]} scale={1.00} leafColor="#3A7A30" />
      <Tree position={[ 3.8, -0.7,  0.6]} scale={0.85} leafColor="#356E2C" />
      <Tree position={[-3.3, -0.8, -1.8]} scale={0.72} leafColor="#2E6626" />

      {/* ── Nameplate ── */}
      <Html position={[0, 2.06, 2.1]} center distanceFactor={8}>
        <div
          style={{ pointerEvents: "none" }}
          className="bg-amber-800/85 text-amber-100 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded select-none whitespace-nowrap border border-amber-600/60 uppercase shadow-sm"
        >
          KinderHub
        </div>
      </Html>
    </group>
  )
}

// ─── Ground ──────────────────────────────────────────────────────────────────

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.72, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4E8A3C" roughness={0.98} />
      </mesh>
      {/* Gravel path continuation past steps */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.715, 5.8]}>
        <planeGeometry args={[1.7, 5]} />
        <meshStandardMaterial color="#C8C0A8" roughness={1} />
      </mesh>
    </>
  )
}

// ─── Camera fly-in ────────────────────────────────────────────────────────────

const CAM_START = new THREE.Vector3(0, 3.5, 13)
const CAM_END   = new THREE.Vector3(0, 0.5, 2.9)

function SceneController({
  flying, resetTrigger, onFlyComplete,
}: {
  flying: boolean
  resetTrigger: number
  onFlyComplete: () => void
}) {
  const { camera } = useThree()
  const progress = useRef(0)
  const done     = useRef(false)

  useEffect(() => {
    camera.position.copy(CAM_START)
    camera.lookAt(0, 0, 0)
    progress.current = 0
    done.current = false
  }, [resetTrigger, camera])

  useFrame((_, delta) => {
    if (!flying || done.current) return
    progress.current = Math.min(progress.current + delta * 0.5, 1)
    const t = 1 - Math.pow(1 - progress.current, 3)
    camera.position.lerpVectors(CAM_START, CAM_END, t)
    camera.lookAt(0, 0, 0)
    if (progress.current >= 1) { done.current = true; onFlyComplete() }
  })

  return null
}

// ─── Team overlay ─────────────────────────────────────────────────────────────

const TEAMS = [
  { name: "Reception",     emoji: "🏫", desc: "Front desk & visitor check-in",      gradient: "from-sky-600/80 to-sky-800/80",     border: "border-sky-500/30 hover:border-sky-400/60"     },
  { name: "Administration",emoji: "📋", desc: "Operations & school management",      gradient: "from-indigo-600/80 to-indigo-800/80",border: "border-indigo-500/30 hover:border-indigo-400/60"},
  { name: "Instructors",   emoji: "🎓", desc: "Teaching staff & curriculum",         gradient: "from-violet-600/80 to-violet-800/80",border: "border-violet-500/30 hover:border-violet-400/60"},
  { name: "Parents",       emoji: "👨‍👩‍👧", desc: "Parent portal & communication",  gradient: "from-rose-600/80 to-rose-800/80",   border: "border-rose-500/30 hover:border-rose-400/60"   },
]

function TeamOverlay({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-lg animate-in fade-in duration-700">
      <div className="w-full max-w-xl px-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-white/50 hover:text-white/90 text-sm transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to entrance
        </button>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome inside</h2>
        <p className="text-white/40 text-sm mb-7">Select a team to manage their space</p>
        <div className="grid grid-cols-2 gap-3">
          {TEAMS.map(({ name, emoji, desc, gradient, border }) => (
            <button
              key={name}
              className={`group relative text-left p-5 rounded-2xl bg-linear-to-br ${gradient} border ${border} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
            >
              <span className="text-2xl block mb-3">{emoji}</span>
              <h3 className="text-white font-semibold text-sm mb-1">{name}</h3>
              <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
              <span className="absolute top-4 right-4 text-white/25 group-hover:text-white/70 transition-colors text-sm">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function KindergartenScene() {
  const [flying, setFlying]       = useState(false)
  const [showTeams, setShowTeams] = useState(false)
  const [resetTrigger, setReset]  = useState(0)

  const handleEnter       = useCallback(() => { if (!flying && !showTeams) setFlying(true) }, [flying, showTeams])
  const handleFlyComplete = useCallback(() => setShowTeams(true), [])
  const handleBack        = useCallback(() => { setShowTeams(false); setFlying(false); setReset((n) => n + 1) }, [])

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 3.5, 13], fov: 58 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Sky handles the background — no explicit color needed */}
        <fog attach="fog" args={["#C8DCF0", 40, 120]} />

        {/* ── Daylight ── */}
        <ambientLight intensity={1.2} color="#FFF5EE" />
        <directionalLight
          position={[10, 14, 8]}
          intensity={2.2}
          color="#FFF8F0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        {/* Cool fill from opposite side */}
        <directionalLight position={[-6, 4, -6]} intensity={0.4} color="#C8E0FF" />

        <Sky
          distance={450000}
          sunPosition={[10, 14, 8]}
          turbidity={5}
          rayleigh={0.4}
          mieCoefficient={0.004}
          mieDirectionalG={0.85}
        />

        <Suspense fallback={null}>
          <Environment preset="park" />
        </Suspense>

        <Suspense fallback={null}>
          <Float speed={0.7} rotationIntensity={0.025} floatIntensity={0.06}>
            <House onEnter={handleEnter} />
          </Float>
        </Suspense>

        <Ground />

        <SceneController flying={flying} resetTrigger={resetTrigger} onFlyComplete={handleFlyComplete} />

        {!flying && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 2.4}
            autoRotate
            autoRotateSpeed={0.4}
          />
        )}
      </Canvas>

      {!flying && !showTeams && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none select-none">
          <div className="bg-black/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/25">
            <p className="text-white text-xs tracking-widest uppercase font-medium drop-shadow">
              Click the building to enter
            </p>
          </div>
          <span className="w-4 h-4 border-2 border-white/60 rounded-full animate-bounce drop-shadow" />
        </div>
      )}

      {showTeams && <TeamOverlay onBack={handleBack} />}
    </div>
  )
}
