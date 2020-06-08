import { access, process } from '../'

export async function taskRunner (path, seasonYear) {
  const data = await access(path, seasonYear)
  const processed = await process(seasonYear, data)

  // TODO
  // 1. Map processed into expected output
  // 2. Save to disk
  // 3. Output stats to console
}
