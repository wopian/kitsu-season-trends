export let store = {
  data: {
    data: [],
    meta: {
      current: 0,
      total: 0
    },
    updated: ''
  },
  count: {
    updated: [],
    removed: [],
    added: []
  },
  currentlyAiring: [],
  willBePruned: []
}

export function initStore (response) {
  const { data, meta, updated } = JSON.parse(response)
  store.data.data = data
  store.data.meta = meta
  store.data.updated = updated
  store.willBePruned = store.data.data.map(obj => obj.i)
}
