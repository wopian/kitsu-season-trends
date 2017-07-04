import rp from 'request-promise'
import low from 'lowdb'
import stringify from 'json-stringify-pretty-compact'
import fileAsync from 'lowdb/lib/storages/file-async'
import wmean from 'weighted-mean'
import { season, year } from '../src/util'

const version = 'edge'
const base = `https://kitsu.io/api/${version}`
// Days since epoch
// const now = ~~(Date.now() / 1000 / 60 / 60 / 24)
const now = new Date().toISOString()

const q = {
  // 20 results per request
  limit: 'page[limit]=20',
  // Currently airing tv and min userCount of 10
  filter: 'filter[status]=current&filter[subtype]=tv',
  // Sort by highest rated then most users
  sort: 'sort=-averageRating,-userCount',
  fields: 'fields[anime]=slug,canonicalTitle,ratingFrequencies,userCount,favoritesCount,posterImage'
}

// Load season database
const db = low(`./data/${year()}-${season()}.json`, {
  storage: fileAsync,
  format: {
    serialize: data => stringify(data, { maxLength: 250 })
  }
})

// Set defaults if new season
db.defaults({ data: {} }).write()

// Array of all shows that have started airing. Airing shows will be
// removed, leaving only shows that have finished - which will be
// updated manually
const aired = Object.keys(db.get('data').value())

function display (count, processed, offset, { hasAired = false, removed = false } = {}) {
  try {
    if (!hasAired && offset + 20 > count) offset = count
    const progress = ((processed + offset) / count * 100)
    console.log(`${processed + offset} - ${(progress > 100 ? 100 : progress).toFixed(1)}% Complete${removed ? ' (deleted erroneous entry)' : ''}`)
  } catch (err) {
    console.error(err)
  }
}

async function get (path, { offset = 0, id = null, upcoming = false } = {}) {
  try {
    if (id) return JSON.parse(await rp(`${base}/${path}/${id}?${q.fields},endDate`))
    else if (upcoming) return JSON.parse(await rp(`${base}/${path}?page[offset]=${offset}&${q.limit}&${q.sort}&${q.fields}&filter[subtype]=tv&filter[season_year]=${year()}&filter[season]=${season()}`))
    else return JSON.parse(await rp(`${base}/${path}?page[offset]=${offset}&${q.limit}&${q.filter}&${q.sort}&${q.fields}`))
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

async function set (id, attributes, { mean, usersRated }) {
  try {
    db.set(`data.${id}`, {
      id,
      updated: now,
      mean: [ mean ],
      slug: attributes.slug,
      usersRated: [ usersRated ],
      users: [ attributes.userCount ],
      title: attributes.canonicalTitle,
      poster: attributes.posterImage.medium,
      favorites: [ attributes.favoritesCount ]
    }).write()
  } catch (err) {
    console.error(err)
  }
}

async function update (id, attributes, { mean, usersRated }) {
  try {
    const latest = db.get(`data.${id}`).value()
    latest.updated = now
    latest.mean.push(mean)
    latest.slug = attributes.slug
    latest.usersRated.push(usersRated)
    latest.users.push(attributes.userCount)
    latest.title = attributes.canonicalTitle
    latest.poster = attributes.posterImage.medium
    latest.favorites.push(attributes.favoritesCount)
    db.set(`data.${id}`, latest).write()
  } catch (err) {
    console.error(err)
  }
}

async function check ({ id, attributes }) {
  try {
    const ratings = calcRatings(attributes.ratingFrequencies)
    if (!db.get(`data.${id}`).value()) await set(id, attributes, ratings)
    else await update(id, attributes, ratings)
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
    const { data, links } = await get('anime', {
      offset,
      upcoming: true
    })

    data.forEach(async anime => {
      const exists = db.get('data').find({ id: anime.id }).value()
      if (typeof exists === 'undefined') {
        await check(anime)
        console.log(`  Added ${anime.attributes.canonicalTitle}`)
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
      const ended = data.attributes.endDate
      const cutoff = new Date(now).getTime() - (3 * 30 * 24 * 60 * 60 * 1000)
      const endDate = new Date(ended === null ? new Date(now).getTime() + (24 * 60 * 60 * 100) : ended).getTime()
      if (endDate - cutoff > 0) await check(data)
      else await remove(data)

      console.log((endDate - cutoff > 0 ? 'Updated ' : 'Removed ') + data.attributes.canonicalTitle)
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
      addUpcoming()
    }
  } catch (err) {
    console.error(err)
  }
})()
