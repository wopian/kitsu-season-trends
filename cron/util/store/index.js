const JSON5 = require('json5')

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
    skipped: [],
    added: [],
    removed: []
  },
  currentlyAiring: [],
  willBePruned: []
}

export function initStore (response) {
  if (response) {
    const { data, meta, updated } = JSON5.parse(response)
    store.data.data = data
    store.data.meta = meta
    store.data.updated = updated
    store.willBePruned = store.data.data.map(obj => obj.i)
  }
}
