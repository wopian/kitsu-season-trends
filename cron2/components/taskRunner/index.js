import { processData } from '../'
import { accessData } from '../accessData'

export async function taskRunner (path, seasonYear) {
  const data = await accessData(path, seasonYear)
  processData(path, seasonYear, data)
  return
}
