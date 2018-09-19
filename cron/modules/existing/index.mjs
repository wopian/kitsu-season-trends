import { KEEP_IF_ENDED_AFTER, API_ANIME_FIELD } from '../../constants'
import { api, store, checkExists, error } from '../../util'

function getExisting (id) {
  return api.get('anime', {
    fields: { anime: API_ANIME_FIELD },
    filter: { id }
  })
}

export async function updateExisting () {
  await Promise.all(store.willBePruned.map(async id => {
    const { data } = await getExisting(id)
      .catch(({ message, config }) => error(message, config))

    const anime = data[0]
    const ended = new Date(anime.endDate)
    const cutoff = new Date(KEEP_IF_ENDED_AFTER)
    const distance = ended - cutoff

    if (anime.status === 'current' || distance >= 0 || anime.endDate === null) await checkExists(anime)
  }))
}
