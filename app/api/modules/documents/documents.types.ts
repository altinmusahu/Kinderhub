export type Documents = {
  id: string
  file_url: string
  kid_id: string | null
  user_id: string | null
  family_id: string | null
  class_id: string | null
  created_at: string
}

export type CreateDocumentsDto = Omit<Documents, "id" | "created_at">
export type UpdateDocumentsDto = Partial<CreateDocumentsDto>

export type DocumentWithSubject = {
  id: string
  file_url: string
  storage_path: string
  kid_id: string | null
  user_id: string | null
  family_id: string | null
  class_id: string | null
  subject_name: string | null
  subject_type: "Family" | "Staff" | "Child" | null
  created_at: string
}

export type UploadDocumentInput = {
  file: File
  kid_id: string | null
  user_id: string | null
  family_id: string | null
  class_id: string | null
}