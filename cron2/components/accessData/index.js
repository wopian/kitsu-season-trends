import JSON5 from 'json5'
import { promises as fs } from 'fs'
import { readData } from '../readData'
import { error } from '../../utils'

export async function accessData (path, seasonYear) {
  let data = {
    data: [],
    meta: {},
    updated: ''
  }

  try {
    await fs.access(path)
    const contents = await readData(path, seasonYear)
    data = JSON5.parse(contents)
  } catch (accessError) {
    if (accessError.code !== 'ENOENT') {
      error(`Accessing  ${path}\n${accessError}`)
      process.exit(1)
    }
  }

  return data
}
