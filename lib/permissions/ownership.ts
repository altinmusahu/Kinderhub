import { supabaseAdmin } from "@/lib/supabase-admin"
import type { SessionPayload } from "@/lib/auth"
import type { ResourceKey } from "./resources"

export type DocumentSubject = { kid_id?: string | null; family_id?: string | null; user_id?: string | null; class_id?: string | null }
export type ClassScoped = { class_id: string }
type OwnershipCheckArg = string | DocumentSubject | ClassScoped
type OwnershipChecker = (session: SessionPayload, arg: OwnershipCheckArg) => Promise<boolean>

async function isClassLeadOrAssistant(session: SessionPayload, classId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("classes")
    .select("lead_user_id, assistant_user_id")
    .eq("id", classId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return false
  return data.lead_user_id === session.sub || data.assistant_user_id === session.sub
}

async function isKidInOwnClass(session: SessionPayload, kidId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("kids")
    .select("class_id")
    .eq("id", kidId)
    .eq("tenant_id", session.tenant_id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data?.class_id) return false
  return isClassLeadOrAssistant(session, data.class_id)
}

async function isFamilyInOwnClass(session: SessionPayload, familyId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("kids")
    .select("class_id")
    .eq("family_id", familyId)
    .eq("tenant_id", session.tenant_id)
  if (error) throw new Error(error.message)

  for (const row of data ?? []) {
    if (row.class_id && (await isClassLeadOrAssistant(session, row.class_id))) return true
  }
  return false
}

function asId(arg: OwnershipCheckArg): string {
  if (typeof arg !== "string") {
    throw new Error("Expected a plain id string for this resource's ownership check, got a document subject object.")
  }
  return arg
}

async function checkDocumentSubject(session: SessionPayload, subject: DocumentSubject): Promise<boolean> {
  if (subject.kid_id) return isKidInOwnClass(session, subject.kid_id)
  if (subject.family_id) return isFamilyInOwnClass(session, subject.family_id)
  if (subject.user_id) return subject.user_id === session.sub
  if (subject.class_id) return isClassLeadOrAssistant(session, subject.class_id)
  return false
}

// classes / attendance / hub / curriculum are all passed the class's own id (per the pilot wiring convention)
const checkClassOwnership: OwnershipChecker = async (session, arg) => isClassLeadOrAssistant(session, asId(arg))

const OWNERSHIP_CHECKERS: Partial<Record<ResourceKey, OwnershipChecker>> = {
  classes: checkClassOwnership,
  attendance: checkClassOwnership,
  hub: checkClassOwnership,
  curriculum: checkClassOwnership,

  // accepts either an existing incident's id (look up its kid → class), or — for the create
  // route, where no incident row exists yet — { class_id } directly, since the route already
  // knows the class from the URL.
  incidents: async (session, arg) => {
    if (typeof arg === "object" && "class_id" in arg && arg.class_id) return isClassLeadOrAssistant(session, arg.class_id)

    const incidentId = asId(arg)
    const { data, error } = await supabaseAdmin
      .from("incidents")
      .select("kid_id")
      .eq("id", incidentId)
      .eq("tenant_id", session.tenant_id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data?.kid_id) return false
    return isKidInOwnClass(session, data.kid_id)
  },

  families: async (session, arg) => isFamilyInOwnClass(session, asId(arg)),

  staff: async (session, arg) => asId(arg) === session.sub,

  // documents accepts either an existing document's id (look up its subject), or — for upload
  // routes where no document row exists yet — the subject (kid_id/family_id/user_id/class_id) directly.
  documents: async (session, arg) => {
    if (typeof arg !== "string") return checkDocumentSubject(session, arg)

    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("kid_id, user_id, family_id, class_id")
      .eq("id", arg)
      .eq("tenant_id", session.tenant_id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return false

    return checkDocumentSubject(session, data)
  },
}

export function getOwnershipChecker(resource: ResourceKey): OwnershipChecker | undefined {
  return OWNERSHIP_CHECKERS[resource]
}
