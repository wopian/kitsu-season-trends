import { RANGE, API_ANIME_FIELD, API_SORT } from '../../constants'
import { api, checkExists, store } from '../../util'

function getAiring (offset) {
  return api.get('anime', {
    fields: { anime: API_ANIME_FIELD },
    sort: API_SORT,
    page: { offset, limit: RANGE },
    filter: { subtype: 'tv,ona', status: 'current' }
  })
}

export async function updateAiring (offset = 0) {
  const { data, links, meta } = await getAiring(offset)
  store.data.meta.current = meta.count
  data.forEach(checkExists)
  if (links && links.next) await updateAiring(offset + RANGE)
}
