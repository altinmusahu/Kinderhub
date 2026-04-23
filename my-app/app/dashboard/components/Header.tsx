
export default function Header({title}: {title?: string}) {
  return (
      <div className="border-b">
        <p className="text-black/35 text-xs tracking-widest uppercase">{title}</p>
        <h1 className="text-lg font-bold text-black">Overview</h1>
      </div>
  )
}
