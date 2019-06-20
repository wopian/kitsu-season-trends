import { store } from '../../util/index.mjs'

export async function prune () {
  const ids = store.willBePruned
  store.data.data = await store.data.data.filter(anime => {
    const remove = ids.includes(anime.i)
    if (remove) store.count.removed.push(anime.t)
    return !remove
  })
}
