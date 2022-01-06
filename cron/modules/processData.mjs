import {
  currentSeason,
  currentTime,
  log,
  ratingStats
} from '../utils/index.mjs'
import { queue, tasks } from './index.mjs'

const prepareEntry = (type, entry, ratings) => {
  const data = tasks[type]?.data?.data?.find(item => item?.i === +entry.id) ?? {
    i: null,
    t: null,
    u: null,
    n: null,
    d: []
  }

  const startAsSeason = currentSeason(entry.startDate)

  const isNew =
    startAsSeason.year === tasks[type].year &&
    startAsSeason.season === tasks[type].season

  data.i = Math.trunc(entry.id)
  data.t = entry.canonicalTitle
  data.u = entry.subtype === 'TV' ? 0 : 1 // 0: TV, 1: ONA
  data.n = isNew ? 1 : 0 // 1: New, 0: Leftover
  data.d.push(
    Object.assign(
      {
        i: data.d[data.d.length - 1]?.i + 1 || 0, // Increment index
        d: Math.trunc((new Date(currentTime()) / 36e5).toFixed(0)), // Hours since epoch
        w: ratings.wilson,
        l: ratings.laplace,
        p: ratings.upvotes,
        o: ratings.downvotes,
        r: Math.trunc(ratings.usersRated)
      },
      Math.trunc(entry.favoritesCount) === 0
        ? ''
        : { f: Math.trunc(entry.favoritesCount) }
    )
  )

  return data
}

export const processData = async () => {
  const initialSize = queue.process.size
  do {
    const { entry, types } = queue.process.dequeue()
    const ratings = ratingStats(entry.ratingFrequencies)

    if (ratings.usersRated === 0) continue

    for (const type of types) {
      const data = prepareEntry(type, entry, ratings)
      const dataIndex = tasks[type]?.data?.data?.findIndex(
        item => item?.i === +entry.id
      )

      if (dataIndex >= 0) tasks[type].data.data[dataIndex] = data
      else tasks[type].data.data.push(data)
    }
    log(
      types.size === 2 ? 'shared' : types.values().next().value,
      `Processed ${initialSize - queue.process.size}`
    )
  } while (queue.process.size > 0)
}
