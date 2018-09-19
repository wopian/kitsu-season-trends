import JSON5 from 'json5'
import { access, readFile, writeFile } from 'fs'
import chalk from 'chalk'
import { store, initStore, log } from './util'
import { updateAiring, updateExisting, updateUpcoming, prune, stats } from './modules'
import { FILE, NOW, SEASON, YEAR } from './constants'

access(FILE, async err => {
  if (!err) await readFile(FILE, 'utf8', async (readError, res) => {
    if (readError) throw readError
    await initStore(res)
    log(chalk`{bold.green LOADED} ${SEASON} ${YEAR} season data from {gray ${FILE}}`)
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
    log(chalk`{bold.green SAVED} ${SEASON} ${YEAR} season data to {gray ${FILE}}`)
  })
})
