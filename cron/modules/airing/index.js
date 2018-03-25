import { RANGE, API_ANIME_FIELD, API_SORT, SEASON, YEAR } from '../../constants'
import { api, checkExists, startSeason, year } from '../../util'

function getAiring (offset) {
  return api.get('anime', {
    fields: { anime: API_ANIME_FIELD },
    sort: API_SORT,
    page: { offset, limit: RANGE },
    filter: { subtype: 'tv,ona', status: 'current' }
  })
}

export async function updateAiring (offset = 0) {
  const { data, links } = await getAiring(offset)
  data.forEach(anime => {
    // Ignore Winter 2018 shows starting in Autumn 2017
    if (startSeason(anime.startDate) === 'winter' && SEASON === 'autumn' && YEAR === year(anime.startDate) - 1) return
    // Ignore Spring 2018 shows starting in Winter 2018
    if (startSeason(anime.startDate) === 'spring' && SEASON === 'winter' && YEAR === year(anime.startDate)) return
    // Ignore Summer 2018 shows starting in Spring 2018
    if (startSeason(anime.startDate) === 'summer' && SEASON === 'spring' && YEAR === year(anime.startDate)) return
    // Ignore Autumn 2018 shows starting in Summer 2018
    if (startSeason(anime.startDate) === 'autumn' && SEASON === 'summer' && YEAR === year(anime.startDate)) return
    checkExists(anime)
  })
  if (links && links.next) await updateAiring(offset + RANGE)
}
