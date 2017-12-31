import { api, RANGE } from './'
import { seasonUSFormat, year } from '../../src/util'

const anime = 'slug,canonicalTitle,ratingFrequencies,userCount,favoritesCount,subtype,startDate,endDate'
const sort = '-averageRating,-userCount'

export async function getAnime ({ model = 'anime', offset = 0, id = null, upcoming = false } = {}) {
  try {
    if (id) return api.get(model, {
      fields: { anime },
      filter: { id }
    })

    else if (upcoming) return api.get(model, {
      fields: { anime },
      filter: { subtype: 'tv,ona', season_year: year(), season: seasonUSFormat() },
      sort,
      page: { offset, limit: RANGE }
    })

    else return api.get(model, {
      fields: { anime },
      filter: { status: 'current', subtype: 'tv,ona' },
      sort,
      page: { offset, limit: RANGE }
    })
  } catch (E) {
    if (id) console.error(`Errored getting info on ${model} #${id}:`)
    else if (upcoming) console.error(`Errored getting upcoming ${model} offset ${offset} - ${offset + RANGE}:`)
    else console.error(`Errored getting airing ${model} offset ${offset} - ${offset + RANGE}:`)
    throw E
  }
}
