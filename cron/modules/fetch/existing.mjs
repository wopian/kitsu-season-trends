import { API_ANIME_FIELD, API_RANGE } from '../../constants.mjs'
import { api, log } from '../../utils/index.mjs'
import { queue } from '../index.mjs'

export const fetchExisting = async (type, batch) => {
  const data = await api.get('/anime', {
    params: {
      filter: {
        id: batch.join(',')
      },
      fields: {
        anime: API_ANIME_FIELD
      },
      page: {
        limit: API_RANGE
      }
    }
  })
  return data
}

export const batchFetchExisting = async type => {
  const types = type === 'shared' ? ['current', 'previous'] : [type]

  log(type, 'Starting batch update')

  do {
    let batch = []
    for (let index = 0; index < 20; index++) {
      const id = queue[type].dequeue()
      if (!id) break
      !queue.ids.has(id) && batch.push(id)
    }
    const { data } = await fetchExisting(type, batch)

    for (const entry of data) {
      queue.process.enqueue({ types, entry })
    }

    log(
      type,
      `${Math.ceil(queue[type].size / API_RANGE)
        .toString()
        .padStart(2)} requests remaining`
    )
  } while (queue[type].size > 0)

  log(type, 'Finished batch update')
}
