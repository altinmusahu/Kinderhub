import { supabaseAdmin } from "@/lib/supabase-admin"
import { ClassMenusRepository } from "./class_menus.repository"
import { ClassMenuCell, MealType } from "./class_menus.types"

const MEAL_TYPES: MealType[] = ["breakfast", "snack", "lunch"]
const WEEKDAY_OFFSETS = [0, 1, 2, 3, 4] // Monday–Friday relative to week start

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split("T")[0]
}

export const ClassMenusService = {
  async getWeek(tenantId: string, classId: string, weekStart: string): Promise<ClassMenuCell[]> {
    const weekEnd = addDays(weekStart, 6)
    const rows = await ClassMenusRepository.findForClassAndRange(tenantId, classId, weekStart, weekEnd)

    const byKey = new Map(rows.map((r) => [`${r.date}_${r.meal_type}`, r]))

    const cells: ClassMenuCell[] = []
    for (const offset of WEEKDAY_OFFSETS) {
      const date = addDays(weekStart, offset)
      for (const mealType of MEAL_TYPES) {
        const existing = byKey.get(`${date}_${mealType}`)
        cells.push({
          date,
          meal_type: mealType,
          description: existing?.description ?? null,
          id: existing?.id ?? null,
          created_by_name: existing?.created_by_name ?? null,
          created_at: existing?.created_at ?? null,
        })
      }
    }
    return cells
  },

  async saveCell(tenantId: string, classId: string, userId: string, date: string, mealType: MealType, description: string): Promise<ClassMenuCell> {
    const existing = await ClassMenusRepository.findOne(tenantId, classId, date, mealType)

    const saved = existing
      ? await ClassMenusRepository.update(existing.id, description, userId)
      : await ClassMenusRepository.create({ tenant_id: tenantId, class_id: classId, date, meal_type: mealType, description, created_by: userId })

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name, lastname")
      .eq("id", userId)
      .maybeSingle()

    return {
      date: saved.date,
      meal_type: saved.meal_type,
      description: saved.description,
      id: saved.id,
      created_by_name: user ? `${user.name} ${user.lastname}` : null,
      created_at: saved.created_at,
    }
  },

  async copyWeek(tenantId: string, sourceClassId: string, targetClassId: string, userId: string, weekStart: string): Promise<ClassMenuCell[]> {
    const sourceCells = await ClassMenusService.getWeek(tenantId, sourceClassId, weekStart)

    for (const cell of sourceCells) {
      if (!cell.description) continue
      const existing = await ClassMenusRepository.findOne(tenantId, targetClassId, cell.date, cell.meal_type)
      if (existing) {
        await ClassMenusRepository.update(existing.id, cell.description, userId)
      } else {
        await ClassMenusRepository.create({
          tenant_id: tenantId, class_id: targetClassId, date: cell.date, meal_type: cell.meal_type,
          description: cell.description, created_by: userId,
        })
      }
    }

    return ClassMenusService.getWeek(tenantId, targetClassId, weekStart)
  },
}
