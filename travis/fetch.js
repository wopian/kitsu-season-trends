import rp from 'request-promise'
import low from 'lowdb'
import fileAsync from 'lowdb/lib/storages/file-async'
import mean from 'weighted-mean'
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

async function add (id, attr) {
  const ratings = Object.keys(attr.ratingFrequencies).map(k => [k / 2, +attr.ratingFrequencies[k]])

  let usersRated = 0

  ratings.forEach(rating => {
    usersRated += rating[1]
  })

  if (db.get('data').find({ id }).value() !== undefined) {
    db.get(`data.${id}.mean`).push(
      +mean(ratings).toFixed(2) || 0 // Changing 0 (no ratings) to null is ideal
    ).write()

    db.get(`data.${id}.users`).push(attr.userCount).write()
    db.get(`data.${id}.favorites`).push(attr.favoritesCount).write()
    db.get(`data.${id}.usersRated`).push(usersRated).write()
}
  else {
    // Update media metadata
    db.set(`data.${id}`, {
      id,
      slug: attr.slug,
      title: attr.canonicalTitle,
      users: [attr.userCount],
      usersRated: [usersRated],
      favorites: [attr.favoritesCount],
      poster: attr.posterImage.medium,
      mean: [+mean(ratings).toFixed(2) || 0] // Changing 0 (no ratings) to null is ideal
    }).write()
  }
}

(async function main (offset) {
  const { data, meta, links } = await get('anime', offset)
  for (let item of await data) {
    await add(item.id, item.attributes)
  }
  display(meta.count, data.length, offset)
  if (links.next) await main(offset + 20)
})(0)
