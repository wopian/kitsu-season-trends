import chalk from 'chalk'
import { promises as fs } from 'fs'
import { loaded, error, seasonKind } from '../../utils'

export async function readSeasonData (path, seasonYear) {
  try {
    const contents = await fs.readFile(path, { encoding: 'utf8' })
    loaded(chalk`${seasonKind(seasonYear)} Season data from {gray ${path}}`)
    return contents
  } catch (readError) {
    error(chalk`Reading {gray ${path}}\n${readError}`)
    process.exit(1)
  }
}
