import { listIDs, firstDayOfNextSeason, firstDayOfSeason } from '../../../utils'

export async function pruneDuplicate (data) {
  const uniqueIDs = new Set(listIDs(data, 'id'))
  return Array.from(uniqueIDs).map(id => data.find(resource => resource.id === id))
}

export async function pruneInvalid (data, { season, year }) {
  return data.filter(resource => {
    if (resource.userCount < 5) return false
    if (resource.startDate === null) return false
    if (new Date(resource.startDate) >= firstDayOfNextSeason(season, year)) return false
    if (resource.endDate && new Date(resource.endDate) < firstDayOfSeason(season, year)) return false
    return true
  })
}

export async function prune (seasonYear, data) {
  return pruneInvalid(await pruneDuplicate(data), seasonYear)
}
