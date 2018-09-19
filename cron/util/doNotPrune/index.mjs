import { store } from '../store'

export function doNotPrune (id) {
  store.willBePruned = store.willBePruned.filter(pruneID => ![id].includes(pruneID))
  // store.willBePruned = store.willBePruned::remove(id)
}
