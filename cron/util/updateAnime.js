import { db, TIMESTAMP } from './'

export async function updateAnime (id, { slug, canonicalTitle, userCount, favoritesCount, subtype }, { mean, usersRated }) {
  try {
    const update = db.get(`data.${id}`).value()
    update.s = slug
    update.t = canonicalTitle
    update.u = subtype === 'TV' ? 0 : 1 // 0: TV, 1: ONA
    update.d.push(Object.assign(
      {
        i: update.d[update.d.length - 1].i + 1 || 0, // Increment index
        d: ~~(TIMESTAMP / 3600000).toFixed(0) // Hours since epoch
      },
      mean === 0 ? '' : { m: mean },
      ~~usersRated === 0 ? '' : { r: ~~usersRated },
      ~~userCount === 0 ? '' : { u: ~~userCount },
      ~~favoritesCount === 0 ? '' : { f: ~~favoritesCount }
    ))
    db.set(`data.${id}`, update).write()
  } catch (E) {
    console.error(`Errored updating ${canonicalTitle} (${id}) in the database:`)
    throw E
  }
}
