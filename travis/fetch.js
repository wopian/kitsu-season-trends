import rp from 'request-promise'
import low from 'lowdb'
import fileAsync from 'lowdb/lib/storages/file-async'
import wmean from 'weighted-mean'
import { season, year } from '../src/season'

const version = 'edge'
const base = `https://kitsu.io/api/${version}`
// Days since epoch
// const now = ~~(Date.now() / 1000 / 60 / 60 / 24)
const now = new Date().toISOString()

const q = {
  // 20 results per request
  limit: 'page[limit]=20',
  // Currently airing tv and min userCount of 10
  filter: 'filter[status]=current&filter[subtype]=tv&filter[userCount]=10..',
  // Sort by highest rated then most users
  sort: 'sort=-averageRating,-userCount',
  fields: 'fields[anime]=slug,canonicalTitle,ratingFrequencies,userCount,favoritesCount,posterImage'
}

// Load season database
const db = low(`./data/${year()}-${season()}.json`, {
  storage: fileAsync,
  format: {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  }
})

// Set defaults if new season
db.defaults({ data: {} }).write()

// Array of all shows that have started airing. Airing shows will be
// removed, leaving only shows that have finished - which will be
// updated manually
const aired = Object.keys(db.get('data').value())

function display (count, processed, offset, isAired = false) {
  if (!isAired && offset + 20 > count) offset = count
  const progress = ((processed + offset) / count * 100)
  console.log(`${processed + offset} - ${(progress > 100 ? 100 : progress).toFixed(1)}% Complete`)
}

async function get (path, offset, id = null) {
  if (id) return JSON.parse(await rp(`${base}/${path}/${id}?${q.fields}`))
  else return JSON.parse(await rp(`${base}/${path}?page[offset]=${offset}&${q.limit}&${q.filter}&${q.sort}&${q.fields}`))
}

function calcRatings (frequency) {
  const ratings = Object.keys(frequency).map(key => [ key / 2, +frequency[key] ])
  return {
    mean: +wmean(ratings).toFixed(2) || 0, // Changing 0 (no ratings) to null is ideal
    usersRated: +ratings.reduce((sum, x) => x[1] + (sum[1] ? sum[1] : sum))
  }
}

async function set (id, attributes, { mean, usersRated }) {
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
}

async function update (id, attributes, { mean, usersRated }) {
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
}

async function check ({ id, attributes }) {
  const ratings = calcRatings(attributes.ratingFrequencies)
  if (!db.get(`data.${id}`).value()) await set(id, attributes, ratings)
  else await update(id, attributes, ratings)
}

async function getAiring (offset) {
  const { data, meta, links } = await get('anime', offset)
  for (let item of await data) {
    aired.splice(aired.indexOf(item.id), 1)
    await check(item)
  }
  display(meta.count, data.length, offset)
  return links
}

async function getAired () {
  console.log(`\nUpdating aired anime\n`)
  let done = 0
  aired.forEach(async id => {
    const { data } = await get('anime', null, id)
    await check(data)
    display(aired.length, done++, 1, true)
  })
}

(async function main (offset) {
  const { next } = await getAiring(offset)
  if (next) await main(offset + 20)
  else await getAired()
})(0)
