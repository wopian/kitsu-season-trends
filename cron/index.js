import { access, readFile, writeFile } from 'fs'
import stringify from 'json-stringify-pretty-compact'
import chalk from 'chalk'
import { store, initStore } from './util'
import { updateAiring, updateExisting, updateUpcoming, prune, stats } from './modules'
import { FILE, NOW, SEASON, YEAR } from './constants'

const log = console.log

access(FILE, async err => {
  if (!err) await readFile(FILE, 'utf8', async (readError, res) => {
    if (readError) throw readError
    await initStore(res)
    log(chalk`{bold.green LOADED} ${SEASON} ${YEAR} season data from {gray ${FILE}}`)
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
    log(chalk`{bold.green SAVED} ${SEASON} ${YEAR} season data to {gray ${FILE}}`)
  })
})
