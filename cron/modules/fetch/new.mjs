import { api, startsBeforeSeasonStart, finishedBeforeSeasonStart, currentSeason, log } from '../../utils/index.mjs'
import { API_ANIME_FIELD, API_SORT, API_RANGE } from '../../constants.mjs'
import { queue } from '../index.mjs'

const getNew = (status, offset) => {
  return api.get('anime', {
    params: {
      fields: { anime: API_ANIME_FIELD },
      sort: API_SORT,
      page: { offset, limit: API_RANGE },
      filter: { subtype: 'tv,ona', status }
    }
  })
}

export const fetchNew = async (type, status = 'current', offset = 0) => {
  log(type, `Fetching request ${(Math.ceil(offset / API_RANGE)).toString().padStart(2)} for ${status}`)

  const { data, links } = await getNew(status, offset).catch(({ message, config }) => console.error(message, config))

  await Promise.all(data.map(async entry => {
    const types = new Set()
    // const types = startsBeforeSeasonStart('current', entry.startDate, entry.id === '45252' ? entry.id : undefined) ? ['current', 'previous'] : [type]
    if (startsBeforeSeasonStart(type, entry.startDate)) {
      types.add('previous')
    }

    const entrySeason = currentSeason(entry.startDate)

    if (currentSeason().year === entrySeason.year && currentSeason().season === entrySeason.season) {
      types.add('current')
    }

    if (!finishedBeforeSeasonStart(type, entry.endDate)) {
      types.add('current')
    }

    if (queue.ids.has(~~entry.id)) return // Ignore duplicate entries
    if (entry.status !== status) return
    queue.process.enqueue({ types, entry })
    queue.ids.add(~~entry.id)
  }))

  if (links && links.next) await fetchNew(type, status, offset + API_RANGE)
  else {
    log(type, `Finished fetching ${status}`)
    return true
  }
}