import Kitsu from 'kitsu'
import low from 'lowdb'
import stringify from 'json-stringify-pretty-compact'
import fileAsync from 'lowdb/lib/storages/file-async'
import wmean from 'weighted-mean'
import {season, year } from '../src/util'

const kitsu = new Kitsu()
const now = new Date().toISOString()
const timestamp = new Date(now).getTime()

// Load season database
const db = low(`./data/${year()}-${season()}.json`, {
  storage: fileAsync,
  format: {
    serialize: data => stringify(data, { maxLength: 250 })
  }
})

// Set defaults if new season
db.defaults({ data: {}, meta: {}, updated: '' }).write()

// Array of all shows that have started airing. Airing shows will be
// removed, leaving only shows that have finished - which will be
// updated manually
const aired = Object.keys(db.get('data').value())

function display (count, processed, offset) {
  try {
    if (offset + 20 > count) offset = count
    const progress = ((processed + offset) / count * 100)
    console.log(`${processed + offset} - ${(progress > 100 ? 100 : progress).toFixed(1)}% Complete`)
  } catch (err) {
    console.error(err)
  }
}

async function get (model, { offset = 0, id = null, upcoming = false } = {}) {
  try {
    if (id) return kitsu.get(`${model}/${id}`, {
      fields: {
        anime: 'slug,canonicalTitle,ratingFrequencies,userCount,favoritesCount,posterImage,endDate,subtype'
      }
    })
    else if (upcoming) return kitsu.get(model, {
      page: {
        offset,
        limit: 20
      },
      fields: {
        anime: 'slug,canonicalTitle,ratingFrequencies,userCount,favoritesCount,posterImage,subtype'
      },
      filter: {
        subtype: 'tv,ona',
        season_year: year(),
        season: season()
      },
      sort: '-averageRating,-userCount'
    })
    else return kitsu.get(model, {
      page: {
        offset,
        limit: 20
      },
      filter: {
        status: 'current',
        subtype: 'tv,ona'
      },
      fields: {
        anime: 'slug,canonicalTitle,ratingFrequencies,userCount,favoritesCount,posterImage,subtype'
      },
      sort: '-averageRating,-userCount'
    })
  } catch (err) {
    console.error(err)
  }
}

function calcRatings (frequency) {
  try {
    const ratings = Object.keys(frequency).map(key => [ key / 2, +frequency[key] ])
    return {
      mean: +wmean(ratings).toFixed(2) || 0, // Changing 0 (no ratings) to null is ideal
      usersRated: ratings.reduce((sum, x) => ~~x[1] + ~~(sum[1] ? sum[1] : sum), 0)
    }
  } catch (err) {
    console.error(err)
  }
}

async function set (id, { slug, canonicalTitle, posterImage, userCount, favoritesCount, subtype }, { mean, usersRated }) {
  try {
    db.set(`data.${id}`, {
      i: ~~id,
      s: slug,
      t: canonicalTitle,
      u: subtype === 'TV' ? 0 : 1,
      d: [
        {
          i: 0,                   // index
          d: timestamp / 3600000, // Hours since epoch
          m: mean,
          r: ~~usersRated,
          u: ~~userCount,
          f: ~~favoritesCount
        }
      ]
    }).write()
  } catch (err) {
    console.error(err)
  }
}

async function update (id, { slug, canonicalTitle, posterImage, userCount, favoritesCount, subtype }, { mean, usersRated }) {
  try {
    const latest = db.get(`data.${id}`).value()
    latest.s = slug
    latest.t = canonicalTitle
    latest.u = subtype === 'TV' ? 0 : 1
    latest.d.push({
      i: latest.d.slice(-1)[0].i + 1 || 0, // index
      d: timestamp / 3600000,              // Hours since epoch
      m: mean,
      r: ~~usersRated,
      u: ~~userCount,
      f: ~~favoritesCount
    })
    db.set(`data.${id}`, latest).write()
  } catch (err) {
    console.error(err)
  }
}

async function check (data) {
  try {
    const ratings = calcRatings(data.ratingFrequencies)
    if (!db.get(`data.${data.id}`).value()) await set(data.id, data, ratings)
    else await update(data.id, data, ratings)
    db.set('updated', now).write()
  } catch (err) {
    console.error(err)
  }
}

async function remove ({ id }) {
  try {
    await db.unset(`data.${id}`).write()
  } catch (err) {
    console.error(err)
  }
}

async function getAiring (offset = 0) {
  try {
    const { data, meta, links } = await get('anime', { offset })
    for (let item of await data) {
      aired.splice(aired.indexOf(item.id), 1)
      await check(item)
    }
    await display(meta.count, data.length, offset)
    return links
  } catch (err) {
    console.error(err)
  }
}

// Updates shows that are airing this season, but have not yet aired
async function addUpcoming (offset = 0) {
  try {
    const { data, meta, links } = await get('anime', {
      offset,
      upcoming: true
    })

    // Update current season anime count
    db.set('meta.current', meta.count).write()

    data.forEach(async anime => {
      const exists = db.get('data').find({ i: ~~anime.id }).value()
      if (typeof exists === 'undefined') {
        await check(anime)
        console.log(`  Added ${anime.canonicalTitle}`)
      }
    })

    if (links.next) await addUpcoming(offset + 20)
  } catch (err) {
    console.error(err)
  }
}

// Updates shows that have finished - but aired during the season
// Additionally, also trims erroneous (old) shows from the data
function getAired () {
  try {
    aired.forEach(async id => {
      const { data } = await get('anime', { id })
      // Check if the show ended within this season
      // If not, it was an erroneous entry and shouldn't be in the season's data
      // at all - thus remove it entirely
      const ended = data.endDate
      const cutoff = new Date(now).getTime() - (3 * 30 * 24 * 60 * 60 * 1000)
      const endDate = new Date(ended === null ? new Date(now).getTime() + (24 * 60 * 60 * 100) : ended).getTime()
      if (endDate - cutoff > 0) await check(data)
      else await remove(data)

      console.log((endDate - cutoff > 0 ? 'Updated ' : 'Removed ') + data.canonicalTitle)
    })
  } catch (err) {
    console.error(err)
  }
}

(async function main (offset = 0) {
  try {
    const { next } = await getAiring(offset)
    if (next) await main(offset + 20)
    else {
      console.log('\nUpdating existing & upcoming anime:\n')
      await getAired()
      await addUpcoming()

      // Update total anime
      db.set('meta.total', db.get('data').size().value()).write()
    }
  } catch (err) {
    console.error(err)
  }
})()
