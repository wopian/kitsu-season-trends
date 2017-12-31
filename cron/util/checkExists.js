import { getMean, setAnime, updateAnime, NOW } from './'
import { db } from './db'

export async function checkExists (data) {
  try {
    const ratings = getMean(data.ratingFrequencies)
    if (!db.get(`data.${data.id}`).value()) await setAnime(data.id, data, ratings)
    else await updateAnime(data.id, data, ratings)
    db.set('updated', NOW).write()
  } catch (E) {
    console.error(`Errored while checking if ${data.canonicalTitle} (${db.id}) was in database:`)
    throw E
  }
}
