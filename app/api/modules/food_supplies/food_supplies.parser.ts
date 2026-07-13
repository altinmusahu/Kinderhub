import { anthropic } from "@/lib/anthropic"

export type ParsedReceiptItem = {
  item_name: string
  quantity: number | null
  unit: string | null
  unit_cost: number | null
  line_total: number
  confidence: "high" | "low"
}

export type ParsedReceipt = {
  vendor_name: string | null
  purchase_date: string | null // YYYY-MM-DD, null if unreadable
  items: ParsedReceiptItem[]
  total_cost: number | null
}

const RECEIPT_SCHEMA = {
  type: "object" as const,
  properties: {
    vendor_name: { type: ["string", "null"], description: "Store or vendor name printed on the receipt, or null if unreadable" },
    purchase_date: { type: ["string", "null"], description: "Purchase date in YYYY-MM-DD format, or null if unreadable" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item_name: { type: "string", description: "Name of the purchased item, transcribed as printed (may be abbreviated or in a non-English language)" },
          quantity: { type: ["number", "null"] },
          unit: { type: ["string", "null"], description: "Unit of measure, e.g. pc, kg, l" },
          unit_cost: { type: ["number", "null"] },
          line_total: { type: "number", description: "Total price for this line item" },
          confidence: { type: "string", enum: ["high", "low"], description: "'low' if any field on this row was hard to read, ambiguous, or guessed" },
        },
        required: ["item_name", "quantity", "unit", "unit_cost", "line_total", "confidence"],
        additionalProperties: false,
      },
    },
    total_cost: { type: ["number", "null"], description: "The grand total printed on the receipt, or null if unreadable" },
  },
  required: ["vendor_name", "purchase_date", "items", "total_cost"],
  additionalProperties: false,
} as const

const PROMPT = `You are reading a photo of a grocery/food-supply receipt for a childcare center's kitchen records. Extract every line item exactly as printed, along with the vendor, purchase date, and total.

Rules:
- Transcribe item names as printed, even if abbreviated or in a language other than English.
- If quantity, unit, or unit cost is not printed or unreadable, use null rather than guessing a number.
- line_total should reflect what's printed for that row, even if quantity × unit_cost doesn't reconcile.
- Mark confidence "low" on any row where you had to guess, the print is blurry/cut off, or the item name is ambiguous.
- If the vendor name, date, or total isn't legible, return null for that field rather than fabricating a value.`

export async function parseReceiptImage(file: File): Promise<ParsedReceipt> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString("base64")
  const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif"

  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    output_config: {
      format: {
        type: "json_schema",
        schema: RECEIPT_SCHEMA,
      },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  })

  if (response.stop_reason === "refusal") {
    throw new Error("Could not read this receipt automatically. Please enter the details manually.")
  }

  const block = response.content.find((b) => b.type === "text")
  if (!block || block.type !== "text") {
    throw new Error("Receipt scan returned no data. Please enter the details manually.")
  }

  return JSON.parse(block.text) as ParsedReceipt
}
