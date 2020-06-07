import { processData } from '../'
import { accessData } from '../accessData'

export async function taskRunner (path, seasonYear) {
  const data = await accessData(path, seasonYear)
  await processData(path, seasonYear, data)
}
