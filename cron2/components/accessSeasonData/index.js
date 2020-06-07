import chalk from 'chalk'
import JSON5 from 'json5'
import { promises as fs } from 'fs'
import { readSeasonData, processData } from '../'
import { error } from '../../utils'

export async function accessSeasonData (path, seasonYear) {
  let data = {
    data: [],
    meta: {},
    updated: ''
  }

  try {
    await fs.access(path)
    const contents = await readSeasonData(path, seasonYear)
    data = JSON5.parse(contents)
  } catch (accessError) {
    if (!accessError?.code === 'ENOENT') {
      error(chalk`Accessing {gray ${path}}\n${accessError}`)
      process.exit(1)
    }
  }

  processData(path, seasonYear, data)

  /*
  fs.access(path, accessError => {
    // Don't load season data on first day of the season as file wont exist
    if (accessError?.code === 'ENOENT') data = {}
    else if (accessError) {
      error(chalk`Accessing {gray ${path}}\n${accessError}`)
      process.exit(1)
    }
    // else data = readSeasonData(path)
    console.log(data)
  })
  */

}
