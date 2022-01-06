import JSON5 from 'json5'
import { readFile } from 'node:fs/promises'

import { log } from '../utils/index.mjs'

export const read = async task => {
  const { season, year } = task
  const FILE = `./data/${year}-${season}.json5`
  try {
    task.data = JSON5.parse(await readFile(FILE))
    log(
      'info',
      `Loaded data for ${season} ${year} (${task.data.meta.total} entries)`
    )
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    else {
      task.data = {
        data: [],
        meta: { current: 0, total: 0 },
        updated: '',
        useLaplace: true
      }
      log('info', `No data found for ${season} ${year}`)
    }
  }
}
