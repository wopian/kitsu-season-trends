import { accessData, processData } from '../'
// import { accessData } from '../accessData'

export async function taskRunner (path, seasonYear) {
  const data = await accessData(path, seasonYear)
  const processed = await processData(seasonYear, data)

  // TODO
  // 1. Map processed into expected output
  // 2. Save to disk
  // 3. Output stats to console
}
