import rp from 'request-promise'
import low from 'lowdb'
import fileAsync from 'lowdb/lib/storages/file-async'
import wmean from 'weighted-mean'
import { season, year } from '../src/season'

const version = 'edge'
const base = `https://kitsu.io/api/${version}`

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

function display (count, processed, offset) {
  if (offset + 20 > count) offset = count
  console.log(`${processed + offset} - ${(offset / count * 100).toFixed(1)}% Complete`)
}

async function get (path, offset) {
  return JSON.parse(await rp(`${base}/${path}?page[offset]=${offset}&${q.limit}&${q.filter}&${q.sort}&${q.fields}`))
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

(async function main (offset) {
  const { data, meta, links } = await get('anime', offset)
  for (let item of await data) {
    await check(item)
  }
  display(meta.count, data.length, offset)
  if (links.next) await main(offset + 20)
})(0)
