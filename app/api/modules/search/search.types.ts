export type SearchFamilyResult = {
  id: string
  name: string
  status: string
}

export type SearchClassResult = {
  id: string
  name: string
}

export type SearchKidResult = {
  id: string
  firstname: string
  lastname: string
  family_id: string
  family_name: string | null
}

export type SearchResults = {
  families: SearchFamilyResult[]
  classes: SearchClassResult[]
  kids: SearchKidResult[]
}
