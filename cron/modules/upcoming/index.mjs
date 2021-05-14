import { RANGE, API_ANIME_FIELD, API_SORT, USSEASON, YEAR } from '../../constants/index.mjs'
import { api, checkExists, error } from '../../util/index.mjs'

function getUpcoming (offset) {
  return api.get('anime', {
    params: {
      fields: { anime: API_ANIME_FIELD },
      sort: API_SORT,
      page: { offset, limit: RANGE },
      filter: { subtype: 'tv,ona', status: 'upcoming', season_year: YEAR, season: USSEASON }
    }
  })
}

export async function updateUpcoming (offset = 0) {
  const { data, links } = await getUpcoming(offset)
    .catch(({ message, config }) => error(message, config))

  await Promise.all(data.map(async anime => {
    // Kitsu API status filter is broken as of March 2018
    if (anime.status === 'upcoming') await checkExists(anime)
  }))
  if (links && links.next) await updateUpcoming(offset + RANGE)
}
