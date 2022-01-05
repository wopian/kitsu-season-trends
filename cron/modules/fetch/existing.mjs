import { api, log } from '../../utils/index.mjs'
import { queue } from '../index.mjs'
import { API_RANGE, API_ANIME_FIELD } from '../../constants.mjs'

export const fetchExisting = async (type, batch) => {
  const data = await api.get('/anime', { params: {
    filter: {
      id: batch.join(',')
    },
    fields: {
      anime: API_ANIME_FIELD
    },
    page: {
      limit: API_RANGE
    }
  }})
  return data
}

export const batchFetchExisting = async type => {
  const types = type === 'shared' ? ['current', 'previous'] : [type]

  log(type, 'Starting batch update')

  do {
    let batch = []
    for (let i = 0; i < 20; i++) {
      const id = queue[type].dequeue()
      if (!id) break
      !queue.ids.has(id) && batch.push(id)
    }
    const { data } = await fetchExisting(type, batch)

    for (const entry of data) {
      queue.process.enqueue({ types, entry })
    }

    log(type, `${Math.ceil(queue[type].size / API_RANGE).toString().padStart(2)} requests remaining`)
  } while (queue[type].size)

  log(type, 'Finished batch update')
}