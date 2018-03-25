import { KEEP_IF_ENDED_AFTER, API_ANIME_FIELD } from '../../constants'
import { api, store, checkExists } from '../../util'

function getExisting (id) {
  return api.get('anime', {
    fields: { anime: API_ANIME_FIELD },
    filter: { id }
  })
}

export async function updateExisting () {
  await Promise.all(store.willBePruned.map(async id => {
    let { data } = await getExisting(id)
    data = data[0]

    const ended = new Date(data.endDate)
    const cutoff = new Date(KEEP_IF_ENDED_AFTER)
    const distance = ended - cutoff

    if (data.status === 'current' || distance >= 0 || data.endDate === null) await checkExists(data)
    console.log('Updating existing')
  }))
}
