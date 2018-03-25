import { store } from '../store'
import { remove } from '../remove'

export function doNotPrune (id) {
  store.willBePruned = store.willBePruned::remove(id)
}
