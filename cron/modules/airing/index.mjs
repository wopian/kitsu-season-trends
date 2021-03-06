import { RANGE, API_ANIME_FIELD, API_SORT, SEASON, YEAR } from '../../constants/index.mjs'
import { api, checkExists, startSeason, year, error } from '../../util/index.mjs'

function getAiring (offset) {
  return api.get('anime', {
    params: {
      fields: { anime: API_ANIME_FIELD },
      sort: API_SORT,
      page: { offset, limit: RANGE },
      filter: { subtype: 'tv,ona', status: 'current' }
    }
  })
}

export async function updateAiring (offset = 0) {
  const { data, links } = await getAiring(offset)
    .catch(({ message, config }) => error(message, config))

  await Promise.all(data.map(async anime => {
    // Kitsu API status filter is broken as of March 2018
    if (anime.status !== 'current') return
    // Ignore Winter 2018 shows starting in Autumn 2017
    if (startSeason(anime.startDate) === 'winter' && SEASON === 'autumn' && YEAR === year(anime.startDate) - 1) return
    // Ignore Spring 2018 shows starting in Winter 2018
    if (startSeason(anime.startDate) === 'spring' && SEASON === 'winter' && YEAR === year(anime.startDate)) return
    // Ignore Summer 2018 shows starting in Spring 2018
    if (startSeason(anime.startDate) === 'summer' && SEASON === 'spring' && YEAR === year(anime.startDate)) return
    // Ignore Autumn 2018 shows starting in Summer 2018
    if (startSeason(anime.startDate) === 'autumn' && SEASON === 'summer' && YEAR === year(anime.startDate)) return
    await checkExists(anime)
  }))
  if (links && links.next) await updateAiring(offset + RANGE)
}
