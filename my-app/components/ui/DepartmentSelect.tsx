"use client"

import { useState, useEffect } from "react"
import { MSelect } from "./Modal"

type Dept = { id: string; name: string }

export function useDepartments() {
  const [departments, setDepartments] = useState<Dept[]>([])
  useEffect(() => {
    fetch("/api/departments")
      .then(r => r.json())
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => setDepartments([]))
  }, [])
  return departments
}

// Styled with MSelect (for use inside Modal forms)
export function DepartmentSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const departments = useDepartments()
  return (
    <MSelect value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select department</option>
      {departments.map(d => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </MSelect>
  )
}

// Plain select (for use outside Modal, e.g. WorkHistoryModal)
export function DepartmentSelectPlain({
  value,
  onChange,
  style,
  name,
}: {
  value: string
  onChange: (value: string) => void
  style?: React.CSSProperties
  name?: string
}) {
  const departments = useDepartments()
  return (
    <select name={name} value={value} onChange={e => onChange(e.target.value)} style={style}>
      <option value="">Select department</option>
      {departments.map(d => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  )
}
