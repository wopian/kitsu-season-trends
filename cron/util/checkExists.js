import { getMean, setAnime, updateAnime, counters } from './'
import { db } from './db'
import { season, year } from '../../src/util'

export async function checkExists (data) {
  try {
    const ratings = getMean(data.ratingFrequencies)
    const isThisSeason = season(data.startDate) === season() && year(data.startDate) === year()
    // Require at least 1 rating...or have started airing in the current season
    if (ratings.mean > 0 || isThisSeason) {
      if (!db.get(`data.${data.id}`).value()) await setAnime(data.id, data, ratings)
      else await updateAnime(data.id, data, ratings)
      counters.updated.push(data.canonicalTitle)
    } else counters.skipped.push(data.canonicalTitle)
  } catch (E) {
    console.error(`Errored while checking if ${data.canonicalTitle} (${db.id}) was in database:`)
    throw E
  }
}
