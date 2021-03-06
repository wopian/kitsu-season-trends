import { KEEP_IF_ENDED_AFTER, API_ANIME_FIELD } from '../../constants/index.mjs'
import { api, store, checkExists, error } from '../../util/index.mjs'

function getExisting (id) {
  return api.get('anime', {
    params: {
      fields: { anime: API_ANIME_FIELD },
      filter: { id }
    }
  })
}

export async function updateExisting () {
  await Promise.all(store.willBePruned.map(async id => {
    const { data } = await getExisting(id)
      .catch(({ message, config }) => error(message, config))

    // Anime was deleted from database
    if (data.length === 0) return
    else {
      const anime = data[0]
      const ended = new Date(anime.endDate)
      const cutoff = new Date(KEEP_IF_ENDED_AFTER)
      const distance = ended - cutoff

      if (anime.status === 'current' || distance >= 0 || anime.endDate === null) await checkExists(anime)
    }
  }))
}
