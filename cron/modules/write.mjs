import JSON5 from 'json5'
import { writeFile } from 'node:fs/promises'
import { currentTime, log } from '../utils/index.mjs'

export const write = async task => {
  const { season, year } = task
  const FILE = `./data/${year}-${season}.json5`

  task.data.data.sort((a, b) => a.i - b.i)
  task.data.updated = currentTime()
  task.data.meta.total = task.data.data.length
  task.data.meta.current = task.data.data.filter(entry => entry.n === 1).length

  try {
    await writeFile(FILE, JSON5.stringify(task.data, { space: 1 }))
    log('info', `Saved data for ${season} ${year} (${task.data.meta.total} entries)`)
  } catch (err) {
    throw err
  }
}