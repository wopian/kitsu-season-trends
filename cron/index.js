import { access, readFile, writeFile } from 'fs'
import stringify from 'json-stringify-pretty-compact'
import { store, initStore } from './util'
import { updateAiring, updateExisting, updateUpcoming, prune, stats } from './modules'
import { FILE, NOW } from './constants'

access(FILE, async err => {
  if (!err) await readFile(FILE, 'utf8', async (readError, res) => {
    if (readError) throw readError
    await initStore(res)
  })

  await updateAiring()
  await updateExisting()
  await updateUpcoming()
  await prune()
  await stats()

  store.data.meta.current = await store.currentlyAiring.length
  store.data.meta.total = await store.data.data.length
  store.data.updated = NOW

  await writeFile(FILE, stringify(store.data, { maxLength: 250 }), writeError => {
    if (writeError) throw writeError
    console.log(`Updated ${FILE}`)
  })
})
