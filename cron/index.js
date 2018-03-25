import { access, readFile, writeFile } from 'fs'
import stringify from 'json-stringify-pretty-compact'
import { store, initStore } from './util'
import { updateAiring, updateExisting, updateUpcoming, prune } from './modules'
import { FILE, NOW } from './constants'

access(FILE, async err => {
  if (!err) readFile(FILE, 'utf8', async (readError, res) => {
    if (readError) throw readError
    initStore(res)
  })

  await updateAiring()
  await updateExisting()
  await updateUpcoming()
  await prune()

  Object.keys(store.count).forEach(counter => {
    const count = store.count[counter].length
    if (count > 0) console.log(`\n${counter[0].toUpperCase()}${counter.slice(1)}: ${count}\n`)
    store.count[counter].sort().forEach(anime => {
      console.log(`  ${anime}`)
    })
  })

  store.data.meta.current = store.currentlyAiring.length
  store.data.meta.total = store.data.data.length
  store.data.updated = NOW

  writeFile(FILE, stringify(store.data, { maxLength: 250 }), writeError => {
    if (writeError) throw writeError
    console.log(`Updated ${FILE}`)
  })
})
