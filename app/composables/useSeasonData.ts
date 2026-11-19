import catalogData from '../../.generated/catalog.msgpack?url&inline'
import type { SeasonInfo, Summary } from '../../shared/trends'
import { decodeMessagePackAsset } from '../utils/decodeMessagePackAsset'

export const seasonCatalog = decodeMessagePackAsset<SeasonInfo[]>(catalogData)
const summaries = import.meta.glob<string>(
  '../../.generated/summaries/*.msgpack',
  { query: '?url&inline', import: 'default' },
)
export async function loadSummary(key: string) {
  const loader = summaries[`../../.generated/summaries/${key}.msgpack`]
  if (!loader)
    throw createError({ statusCode: 404, statusMessage: 'Season not found' })
  return decodeMessagePackAsset<Summary>(await loader())
}
