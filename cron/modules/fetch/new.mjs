import { API_ANIME_FIELD, API_RANGE, API_SORT } from '../../constants.mjs'
import {
  api,
  currentSeason,
  finishedBeforeSeasonStart,
  log,
  startsBeforeSeasonStart
} from '../../utils/index.mjs'
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
  log(
    type,
    `Fetching request ${Math.ceil(offset / API_RANGE)
      .toString()
      .padStart(2)} for ${status}`
  )

  const { data, links } = await getNew(status, offset).catch(
    ({ message, config }) => console.error(message, config)
  )

  await Promise.all(
    data.map(async entry => {
      const entrySeason = currentSeason(entry.startDate)
      const types = new Set()

      if (startsBeforeSeasonStart(type, entry.startDate)) {
        types.add('previous')
      }

      if (
        currentSeason().year === entrySeason.year &&
        currentSeason().season === entrySeason.season
      ) {
        types.add('current')
      }

      if (!finishedBeforeSeasonStart(type, entry.endDate)) {
        types.add('current')
      }

      if (queue.ids.has(Math.trunc(entry.id))) return // Ignore duplicate entries
      if (entry.status !== status) return
      queue.process.enqueue({ types, entry })
      queue.ids.add(Math.trunc(entry.id))
    })
  )

  if (links && links.next) await fetchNew(type, status, offset + API_RANGE)
  else {
    log(type, `Finished fetching ${status}`)
    return true
  }
}
