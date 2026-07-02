import { DocumentsRepository } from "./documents.repository"
import { CreateDocumentsDto, Documents, DocumentWithSubject, UpdateDocumentsDto, UploadDocumentInput } from "./documents.types"

export const DocumentsService = {
  async getAll(tenantId: string): Promise<Documents[]> {
    return DocumentsRepository.findAll(tenantId)
  },

  async getAllForTenant(tenantId: string): Promise<DocumentWithSubject[]> {
    const [{ familyName, userName, kidName }, documents] = await Promise.all([
      DocumentsRepository.findTenantSubjects(tenantId),
      DocumentsRepository.findAllRaw(),
    ])

    const scoped = documents.filter((d) =>
      (d.kid_id && kidName.has(d.kid_id)) ||
      (d.user_id && userName.has(d.user_id)) ||
      (d.family_id && familyName.has(d.family_id))
    )

    if (scoped.length === 0) return []

    const signedUrls = await DocumentsRepository.createSignedUrls(scoped.map((d) => d.file_url))

    return scoped.map((d, i) => {
      const subjectName = d.kid_id
        ? kidName.get(d.kid_id)
        : d.user_id
        ? userName.get(d.user_id)
        : d.family_id
        ? familyName.get(d.family_id)
        : null
      const subjectType = d.kid_id ? "Child" : d.user_id ? "Staff" : d.family_id ? "Family" : null

      return {
        id: d.id,
        file_url: signedUrls[i] ?? d.file_url,
        storage_path: d.file_url,
        kid_id: d.kid_id,
        user_id: d.user_id,
        family_id: d.family_id,
        subject_name: subjectName ?? null,
        subject_type: subjectType,
        created_at: d.created_at,
      }
    })
  },

  async upload(input: UploadDocumentInput): Promise<DocumentWithSubject> {
    const { file, kid_id, user_id, family_id } = input
    if (!kid_id && !user_id && !family_id) {
      throw new Error("Select a family, staff member, or child for this document")
    }

    const ownerId = kid_id ?? user_id ?? family_id
    const storagePath = `${ownerId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

    await DocumentsRepository.uploadFile(storagePath, file)

    const created = await DocumentsRepository.create({ file_url: storagePath, kid_id, user_id, family_id })
    const signedUrl = await DocumentsRepository.createSignedUrl(storagePath)

    return {
      id: created.id,
      file_url: signedUrl,
      storage_path: storagePath,
      kid_id: created.kid_id,
      user_id: created.user_id,
      family_id: created.family_id,
      subject_name: null,
      subject_type: kid_id ? "Child" : user_id ? "Staff" : "Family",
      created_at: created.created_at,
    }
  },

  async create(input: CreateDocumentsDto): Promise<Documents> {
    return DocumentsRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateDocumentsDto): Promise<Documents> {
    return DocumentsRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return DocumentsRepository.delete(id, tenantId)
  },
}
