import { store, remove } from '../../util'

export async function prune () {
  store.willBePruned.forEach(async id => {
    store.count.removed.push(store.data.data.find(anime => ~~anime.i === ~~id).t)
    store.data.data = store.data.data::remove(id)
  })
}
