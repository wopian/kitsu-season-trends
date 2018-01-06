import { db, TIMESTAMP } from './'

export async function setAnime (id, { canonicalTitle, userCount, favoritesCount, subtype }, { mean, usersRated }) {
  try {
    db.set(`data.${id}`, {
      i: ~~id,
      t: canonicalTitle,
      u: subtype === 'TV' ? 0 : 1, // 0: TV, 1: ONA
      d: [Object.assign(
        {
          i: 0, // index
          d: ~~(TIMESTAMP / 3600000).toFixed(0) // Hours since epoch
        },
        mean === 0 ? '' : { m: mean },
        ~~usersRated === 0 ? '' : { r: ~~usersRated },
        ~~userCount === 0 ? '' : { u: ~~userCount },
        ~~favoritesCount === 0 ? '' : { f: ~~favoritesCount }
      )]
    }).write()
  } catch (E) {
    console.error(`Errored adding ${canonicalTitle} (${id}) to the database:`)
    throw E
  }
}
