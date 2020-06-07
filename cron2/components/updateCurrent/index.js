import { API_ANIME_FIELD, API_SORT, RANGE } from '../../constants'
import { api, info, firstDayOfNextSeason, seasonKind } from '../../utils'

async function getResource (offset) {
  return api.get('anime', {
    fields: { anime: API_ANIME_FIELD },
    sort: API_SORT,
    page: { offset, limit: RANGE },
    filter: { subtype: 'tv,ona', status: 'current' }
  })
}

async function getCurrent (offset, { season, year }) {
  let currentData = []
  let hasNextPage = true

  do {
    const { data, links} = await getResource(offset);
    currentData = currentData.concat(data)
    if (!links?.next) hasNextPage = false
    else offset += RANGE
  } while (hasNextPage)

  return currentData.filter(resource => {
    // Kitsu API status filter is broken as of March 2018
    if (resource.status !== 'current') return false
    if (resource.userCount < 5) return false
    if (new Date(resource.startDate) >= firstDayOfNextSeason(season, year)) return false
    return true
  })
}

export async function updateCurrent (seasonYear) {
  info(`${seasonKind(seasonYear)} Current`)
  const currentData = await getCurrent(0, seasonYear)
  info(`${seasonKind(seasonYear)} Current   ${currentData.length} resources`)
  return currentData
}
