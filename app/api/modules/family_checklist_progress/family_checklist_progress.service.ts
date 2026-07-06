import { FamilyChecklistProgressRepository } from "./family_checklist_progress.repository"
import { ClassChecklistItemsRepository } from "../class_checklist_items/class_checklist_items.repository"
import { KidsRepository } from "../kids/kids.repository"
import type {
  FamilyChecklistProgress,
  KidChecklistDetail,
  KidChecklistProgress,
  UpsertFamilyChecklistProgressDto,
} from "./family_checklist_progress.types"

export const FamilyChecklistProgressService = {
  async upsert(input: UpsertFamilyChecklistProgressDto): Promise<FamilyChecklistProgress> {
    return FamilyChecklistProgressRepository.upsert(input)
  },

  // Per-kid rollup: how many of this class's checklist items are checked for each
  // enrolled kid, and which items are still missing. "All children" items always
  // count toward every kid's total; narrower applies-to groups (e.g. "With allergies")
  // only count once a progress row exists for that kid+item, since kids has no
  // flags to know who those groups apply to.
  async getProgressForClass(tenantId: string, classId: string): Promise<KidChecklistProgress[]> {
    const [items, kids] = await Promise.all([
      ClassChecklistItemsRepository.findByClassId(tenantId, classId),
      KidsRepository.findKidsByClassId(tenantId, classId),
    ])
    if (kids.length === 0 || items.length === 0) return []

    const mandatoryItems = items.filter((i) => i.is_mandatory)
    const kidIds = kids.map((k) => k.id)
    const progress = await FamilyChecklistProgressRepository.findByKidIds(kidIds)

    const checkedSet = new Set(
      progress.filter((p) => p.is_checked).map((p) => `${p.kid_id}:${p.checklist_item_id}`)
    )
    const trackedSet = new Set(progress.map((p) => `${p.kid_id}:${p.checklist_item_id}`))

    return kids.map((kid) => {
      const applicableItems = mandatoryItems.filter(
        (item) => item.applies_to === "All children" || trackedSet.has(`${kid.id}:${item.id}`)
      )
      const missing = applicableItems.filter((item) => !checkedSet.has(`${kid.id}:${item.id}`))
      return {
        kid_id: kid.id,
        kid_name: `${kid.firstname} ${kid.lastname}`,
        done: applicableItems.length - missing.length,
        of: applicableItems.length,
        missing: missing.map((item) => item.item_name),
      }
    })
  },

  // Full picture: every checklist item for every enrolled kid, with its checked
  // state — used by the Progress tab where staff can toggle any item for any kid.
  async getDetailedProgressForClass(tenantId: string, classId: string): Promise<KidChecklistDetail[]> {
    const [items, kids] = await Promise.all([
      ClassChecklistItemsRepository.findByClassId(tenantId, classId),
      KidsRepository.findKidsByClassId(tenantId, classId),
    ])
    if (kids.length === 0 || items.length === 0) return []

    const kidIds = kids.map((k) => k.id)
    const progress = await FamilyChecklistProgressRepository.findByKidIds(kidIds)
    const checkedSet = new Set(
      progress.filter((p) => p.is_checked).map((p) => `${p.kid_id}:${p.checklist_item_id}`)
    )

    return kids.map((kid) => ({
      kid_id: kid.id,
      kid_name: `${kid.firstname} ${kid.lastname}`,
      items: items.map((item) => ({
        checklist_item_id: item.id,
        item_name: item.item_name,
        category: item.category,
        is_mandatory: item.is_mandatory,
        applies_to: item.applies_to,
        is_checked: checkedSet.has(`${kid.id}:${item.id}`),
      })),
    }))
  },
}
