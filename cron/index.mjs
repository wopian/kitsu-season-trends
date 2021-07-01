import JSON5 from 'json5'
import { access, readFile, writeFile } from 'fs'
import { bold, green, gray } from 'colorette'
import { store, initStore, log } from './util/index.mjs'
import { updateAiring, updateExisting, updateUpcoming, prune, stats } from './modules/index.mjs'
import { FILE, NOW, SEASON, YEAR } from './constants/index.mjs'

access(FILE, async err => {
  if (!err) await readFile(FILE, 'utf8', async (readError, res) => {
    if (readError) throw readError
    await initStore(res)
    log(`${bold(green('LOADED'))} ${SEASON} ${YEAR} season data from ${gray(FILE)}`)
  })

  await updateAiring()
  await updateUpcoming()
  await updateExisting()
  await prune()
  await stats()

  store.data.meta.current = await store.currentlyAiring.length
  store.data.meta.total = await store.data.data.length
  store.data.updated = NOW

  await writeFile(FILE, JSON5.stringify(store.data, { space: 1 }), writeError => {
    if (writeError) throw writeError
    log(`${bold(green('SAVED'))} ${SEASON} ${YEAR} season data to ${gray(FILE)}`)
  })
})
