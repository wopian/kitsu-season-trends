import catalogData from '../../.generated/catalog.json'
import type { SeasonInfo, Summary } from '../../shared/trends'

export const seasonCatalog = catalogData as SeasonInfo[]
const summaries = import.meta.glob<{ default: Summary }>(
  '../../.generated/summaries/*.json',
)
export async function loadSummary(key: string) {
  const loader = summaries[`../../.generated/summaries/${key}.json`]
  if (!loader)
    throw createError({ statusCode: 404, statusMessage: 'Season not found' })
  return (await loader()).default
}
