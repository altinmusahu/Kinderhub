import ExcelJS from "exceljs"

// ── Kinderhub brand palette (kept in sync with app/globals.css) ──
const BRAND = {
  peach:      "FFD2592F", // primary terracotta
  peachDark:  "FFB24420",
  peachBg:    "FFFAF0EB",
  inkD900:    "FF1A1714",
  ink700:     "FF3D3830",
  ink500:     "FF7A7368",
  ink400:     "FF9E968A",
  border:     "FFE8E4DD",
  rowStripe:  "FFF5F3EF",
  white:      "FFFFFFFF",
}

export type ExcelColumn<T> = {
  header: string
  width?: number
  value: (row: T) => string | number | boolean | null | undefined
}

const THIN_BORDER: Partial<ExcelJS.Border> = { style: "thin", color: { argb: BRAND.border } }

export async function exportToExcelBuffer<T>(
  rows: T[],
  columns: ExcelColumn<T>[],
  options: { sheetName: string; title: string },
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Kinderhub"
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(options.sheetName, {
    views: [{ state: "frozen", ySplit: 4 }],
  })

  const colCount = columns.length
  sheet.columns = columns.map((c) => ({ width: c.width ?? 18 }))

  // ── Title row ──
  sheet.mergeCells(1, 1, 1, colCount)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = options.title
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: BRAND.inkD900 } }
  titleCell.alignment = { vertical: "middle", horizontal: "left" }
  sheet.getRow(1).height = 28

  // ── Generated-on row ──
  sheet.mergeCells(2, 1, 2, colCount)
  const generatedCell = sheet.getCell(2, 1)
  generatedCell.value = `Generated on ${new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })}`
  generatedCell.font = { name: "Calibri", size: 10.5, italic: true, color: { argb: BRAND.ink500 } }
  generatedCell.alignment = { vertical: "middle", horizontal: "left" }
  sheet.getRow(2).height = 18

  // Row 3 stays blank as visual spacing before the table.

  // ── Header row ──
  const headerRowIndex = 4
  const headerRow = sheet.getRow(headerRowIndex)
  columns.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = c.header
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: BRAND.white } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND.peach } }
    cell.alignment = { vertical: "middle", horizontal: "left" }
    cell.border = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER }
  })
  headerRow.height = 22

  // ── Data rows ──
  rows.forEach((row, rowIdx) => {
    const excelRow = sheet.getRow(headerRowIndex + 1 + rowIdx)
    const isStripe = rowIdx % 2 === 1
    columns.forEach((c, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1)
      cell.value = c.value(row) ?? ""
      cell.font = { name: "Calibri", size: 10.5, color: { argb: BRAND.ink700 } }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isStripe ? BRAND.rowStripe : BRAND.white } }
      cell.border = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER }
      cell.alignment = { vertical: "middle", horizontal: "left" }
    })
  })

  // ── Footer: row count ──
  const footerRowIndex = headerRowIndex + 1 + rows.length + 1
  sheet.mergeCells(footerRowIndex, 1, footerRowIndex, colCount)
  const footerCell = sheet.getCell(footerRowIndex, 1)
  footerCell.value = `${rows.length} record${rows.length === 1 ? "" : "s"}`
  footerCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: BRAND.ink400 } }

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}
