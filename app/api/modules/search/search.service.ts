import { SearchRepository } from "./search.repository"
import type { SearchResults } from "./search.types"

const MIN_QUERY_LENGTH = 2

export const SearchService = {
  async search(tenantId: string, rawQuery: string): Promise<SearchResults> {
    const query = rawQuery.trim()
    if (query.length < MIN_QUERY_LENGTH) {
      return { families: [], classes: [], kids: [] }
    }
    const [families, classes, kids] = await Promise.all([
      SearchRepository.searchFamilies(tenantId, query),
      SearchRepository.searchClasses(query),
      SearchRepository.searchKids(tenantId, query),
    ])
    return { families, classes, kids }
  },
}
