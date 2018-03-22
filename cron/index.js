import { readFile, writeFile } from 'fs'
import stringify from 'json-stringify-pretty-compact'
import { store, initStore } from './util'
import { updateAiring, updateExisting, updateUpcoming, prune } from './modules'
import { FILE, NOW } from './constants'

readFile(FILE, 'utf8', async (err, res) => {
  if (err) throw err
  initStore(res)
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

  writeFile(FILE, stringify(store.data, { maxLength: 250 }), err2 => {
    if (err2) throw err2
    console.log(`Updated ${FILE}`)
  })
})
