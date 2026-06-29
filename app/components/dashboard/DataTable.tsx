import React from "react"

export interface Column<T> {
  key: string
  header: React.ReactNode
  headerStyle?: React.CSSProperties
  cell: (row: T) => React.ReactNode
  cellStyle?: React.CSSProperties | ((row: T) => React.CSSProperties)
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  getRowClassName?: (row: T) => string
  title?: React.ReactNode
  meta?: React.ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  getRowClassName,
  title,
  meta,
}: DataTableProps<T>) {
  return (
    <div className="kh-card" style={{ overflow: "hidden" }}>
      {(title || meta) && (
        <div className="kh-card-header">
          {title && <span className="kh-card-title">{title}</span>}
          {meta && <span className="kh-card-meta">{meta}</span>}
        </div>
      )}
      {/* kh-table-scroll enables horizontal scroll on small screens */}
      <div className="kh-table-scroll">
      <table className="kh-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.headerStyle}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className={getRowClassName?.(row)}>
              {columns.map((col) => {
                const style =
                  typeof col.cellStyle === "function"
                    ? col.cellStyle(row)
                    : col.cellStyle
                return (
                  <td key={col.key} style={style}>
                    {col.cell(row)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
