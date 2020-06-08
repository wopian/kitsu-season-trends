import { API_ANIME_FIELD, API_SORT, RANGE } from '../../constants'
import { api, info, error, seasonKind } from '../../utils'

export async function getUpcomingResource (offset, seasonYear) {
  try {
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
  } catch (apiError) {
    throw new Error(error(`requesting upcoming resource\n${apiError}`))
  }
}

export async function getUpcoming (offset, seasonYear) {
  let upcomingData = []
  let hasNextPage = true

  do {
    const { data, links} = await getUpcomingResource(offset, seasonYear);
    upcomingData = upcomingData.concat(data)
    if (!links?.next) hasNextPage = false
    else offset += RANGE
  } while (hasNextPage)

  // Kitsu API status filter is not working as expected as of March 2018
  return upcomingData.filter(resource => resource.status === 'upcoming')
}

export async function updateUpcoming (seasonYear) {
  info(`${seasonKind(seasonYear)} Upcoming`)
  const upcomingData = await getUpcoming(0, seasonYear)
  info(`${seasonKind(seasonYear)} Upcoming  ${upcomingData.length} resources`)
  return upcomingData
}
