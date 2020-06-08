import { API_ANIME_FIELD, API_SORT, RANGE } from '../../../constants'
import { api, info, error, seasonKind } from '../../../utils'

export async function getCurrentResource (offset) {
  try {
    return api.get('anime', {
      fields: { anime: API_ANIME_FIELD },
      sort: API_SORT,
      page: { offset, limit: RANGE },
      filter: { subtype: 'tv,ona', status: 'current' }
    })
  } catch (apiError) {
    throw new Error(error(`requesting current resource\n${apiError}`))
  }
}

export async function getCurrent (offset) {
  let currentData = []
  let hasNextPage = true

  do {
    const { data, links} = await getCurrentResource(offset);
    currentData = currentData.concat(data)
    if (!links?.next) hasNextPage = false
    else offset += RANGE
  } while (hasNextPage)

  // Kitsu API status filter is not working as expected as of March 2018
  return currentData.filter(resource => resource.status === 'current')
}

export async function updateCurrent (seasonYear) {
  info(`${seasonKind(seasonYear)} Current`)
  const currentData = await getCurrent(0)
  info(`${seasonKind(seasonYear)} Current   ${currentData.length} resources`)
  return currentData
}
