import { store } from '../../util'

export async function prune () {
  await store.willBePruned.forEach(async id => {
    store.count.removed.push(store.data.data.find(anime => anime.i === id).t)
    store.data.data = await store.data.data.filter(anime => anime.i !== id)
  })
}
