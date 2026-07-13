import Anthropic from "@anthropic-ai/sdk"

// Server-side only — used to parse receipt photos into structured line items.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
