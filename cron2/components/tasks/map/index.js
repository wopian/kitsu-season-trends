import { TIMESTAMP } from '../../../constants'
import { ratings, startedThisSeason } from '../../../utils'

export async function map (seasonYear, existing, updated) {
  for (const entry of existing) {
    const resource = updated.find(obj => obj.id === entry.i.toString())
    const { mean, usersRated } = ratings(resource.ratingFrequencies)
    const newThisSeason = startedThisSeason(resource.startDate, seasonYear)

    entry.t = resource.canonicalTitle
    entry.u = resource.subtype === 'TV' ? 0 : 1 // 0: TV, 1: ONA
    entry.n = newThisSeason ? 1 : 0 // 1: New, 2: Leftover
    entry.d.push(Object.assign(
      {
        i: entry.d[entry.d.length - 1].i + 1 || 0,
        d: ~~(TIMESTAMP / 36e5).toFixed(0) // Hours since epoch
      },
      ~~mean === 0 ? '' : { m: ~~mean },
      ~~usersRated === 0 ? '' : { r: ~~usersRated },
      ~~resource.userCount === 0 ? '' : { u: ~~resource.userCount },
      ~~resource.favoritesCount === 0 ? '' : { f: ~~resource.favoritesCount }
    ))
  }
  return existing
}
