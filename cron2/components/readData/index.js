import { gray } from 'colorette'
import { promises as fs } from 'fs'
import { loaded, error, seasonKind } from '../../utils'

export async function readData (path, seasonYear) {
  try {
    const contents = await fs.readFile(path, { encoding: 'utf8' })
    loaded(`${seasonKind(seasonYear)} Season data from ${gray(path)}`)
    return contents
  } catch (readError) {
    error(`Reading ${gray(path)}\n${readError}`)
    process.exit(1)
  }
}
