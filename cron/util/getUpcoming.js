// Updates shows that are airing this season, but have not yet aired
import { db, checkExists, getAnime, counters, RANGE } from './'

export async function getUpcoming (offset = 0) {
  try {
    const { data, meta, links } = await getAnime({ offset, upcoming: true })

    // Update current season anime count
    db.set('meta.current', meta.count).write()

    data.forEach(async anime => {
      const exists = db.get('data').find({ i: ~~anime.id }).value()
      if (typeof exists === 'undefined') {
        await checkExists(anime)
        counters.added.push(data.canonicalTitle)
      }
    })

    if (links.next) await getUpcoming(offset + RANGE)
  } catch (E) {
    console.error(`Errored while adding upcoming anime offset ${offset} - ${offset + RANGE}:`)
    throw E
  }
}
