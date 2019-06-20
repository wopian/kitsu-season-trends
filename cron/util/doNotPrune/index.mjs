import { store } from '../index.mjs'

export function doNotPrune (id) {
  store.willBePruned = store.willBePruned.filter(pruneID => ![id].includes(pruneID))
  // store.willBePruned = store.willBePruned::remove(id)
}
