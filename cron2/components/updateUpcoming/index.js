import { API_ANIME_FIELD, API_SORT, RANGE } from '../../constants'
import { api, info, seasonKind } from '../../utils'

async function getResource (offset, seasonYear) {
  return api.get('anime', {
    fields: { anime: API_ANIME_FIELD },
    sort: API_SORT,
    page: { offset, limit: RANGE },
    filter: {
      subtype: 'tv,ona',
      status: 'upcoming',
      season_year: seasonYear.year,
      season: seasonYear.season === 'autumn' ? 'fall' : seasonYear.season
    }
  })
}

async function getUpcoming (offset, seasonYear) {
  let upcomingData = []
  let hasNextPage = true

  do {
    const { data, links} = await getResource(offset, seasonYear);
    upcomingData = upcomingData.concat(data)
    if (!links?.next) hasNextPage = false
    else offset += RANGE
  } while (hasNextPage)

  return upcomingData.filter(resource => {
    // Kitsu API status filter is broken as of March 2018
    if (resource.status !== 'upcoming') return false
    if (resource.userCount < 5) return false
    else return true
  })
}

export async function updateUpcoming (seasonYear) {
  info(`${seasonKind(seasonYear)} Upcoming`)
  const airingData = await getUpcoming(0, seasonYear)
  info(`${seasonKind(seasonYear)} Upcoming  ${airingData.length} resources`)
  return airingData
}
