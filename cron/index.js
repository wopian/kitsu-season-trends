import { db, getAiring, getAnime, removeAnime, checkExists, RANGE, NOW } from './util'
import { aired } from './util/aired'
import { season, year } from '../src/util'

// Updates shows that are airing this season, but have not yet aired
async function addUpcoming (offset = 0) {
  try {
    const { data, meta, links } = await getAnime({ offset, upcoming: true })

    // Update current season anime count
    db.set('meta.current', meta.count).write()

    data.forEach(async anime => {
      const exists = db.get('data').find({ i: ~~anime.id }).value()
      if (typeof exists === 'undefined') {
        await checkExists(anime)
        console.log(`  Added ${anime.canonicalTitle}`)
      }
    })

    if (links.next) await addUpcoming(offset + RANGE)
  } catch (E) {
    console.error(`Errored while adding upcoming anime offset ${offset} - ${offset + RANGE}:`)
    throw E
  }
}

// Updates shows that have finished - but aired during the season
// Additionally, also trims erroneous (old) shows from the data
function getAired () {
  try {
    aired.forEach(async id => {
      let { data } = await getAnime({ id })
      data = data[0]
      let removed = false

      // Check if the show ended within this season
      // If not, it was an erroneous entry and shouldn't be in the season's data
      // at all - thus remove it entirely
      const ended = data.endDate
      const cutoff = new Date(NOW).getTime() - (3 * 30 * 24 * 60 * 60 * 1000)
      const endDate = new Date(ended === null ? new Date(NOW).getTime() + (24 * 60 * 60 * 100) : ended).getTime()

      // Check if the show gets its start date changed to a future season
      const startDate = data.startDate
      const startSeason = season(startDate)

      if (startDate === null || startDate.slice(0, 4) > year()
        || (+startDate.slice(0, 4) === year()
          && (
            (season() === 'winter'
              && (
                startSeason === 'spring'
                || startSeason === 'summer'
                || startSeason === 'autumn'
              )
            )
            || (season() === 'spring'
              && (
                startSeason === 'summer'
                || startSeason === 'autumn'
              )
            )
            || (season() === 'summer' && startSeason === 'autumn')
          )
      )) {
        await removeAnime(data)
        removed = true
      }

      if (!removed && endDate - cutoff <= 0) {
        await removeAnime(data)
        removed = true
      } else if (!removed) await checkExists(data)

      console.log((removed ? 'Removed ' : 'Updated ') + data.canonicalTitle)
    })
  } catch (E) {
    console.error(`Errored while getting aired anime:`)
    throw E
  }
}

(async function main (offset = 0) {
  try {
    const { next } = await getAiring(offset)
    if (next) await main(offset + RANGE)
    else {
      console.log('\nUpdating aired and upcoming anime:\n')
      await addUpcoming()
      await getAired()

      // Update total anime
      db.set('meta.total', db.get('data').size().value()).write()
    }
  } catch (E) {
    throw E
  }
})()
