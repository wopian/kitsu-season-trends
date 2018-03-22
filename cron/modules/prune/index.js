import { store } from '../../util'

export async function prune () {
  store.willBePruned.forEach(id => {
    store.count.removed.push(store.data.data.find(anime => ~~anime.i === ~~id).t)
    store.data.data = store.data.data.filter(anime => ~~anime.i !== ~~id)
  })
}
