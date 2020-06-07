import { firstDayOfNextSeason } from '../../utils'

export async function pruneData ({ season, year }, updatedData) {
  const entriesBefore = updatedData?.length
  // Deduplicate array
  //updatedData = Array.from(new Set(updatedData.map(resource => resource.id)))
  //  .map(id => updatedData.find(resource => resource.id === id))

  /*
  updatedData = await updatedData.filter(resource => {
    if (!resource.startDate) return true
    const resourceDate = new Date(resource.startDate)
    const limit = firstDayOfNextSeason(season, year)
    console.log(limit < resourceDate, resourceDate < limit)
    return limit > resourceDate
  })
  */

  const entriesAfter = updatedData?.length
  console.log(entriesBefore, entriesAfter)
  return updatedData
}
