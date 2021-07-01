import JSON5 from 'json5'
import { promises as fs } from 'fs'
import { gray } from 'colorette'
import { loaded, error } from '../../utils'

export async function importData ({ path, seasonYear } = {}) {
  let data = {
    data: [],
    meta: {},
    updated: ''
  }

  console.log(path)

  try {
    await fs.access(path)
    const contents = await fs.readFile(path, { encoding: 'utf8' })
    loaded(`${seasonKind(seasonYear)} Season data from ${gray(path)}`)
    data = JSON5.parse(contents)
  } catch (accessError) {
    if (accessError.code !== 'ENOENT') {
      error(`Importing ${path}\n${accessError}`)
      process.exit(1)
    }
  }

  return data
}
