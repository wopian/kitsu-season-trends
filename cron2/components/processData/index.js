import { updateCompleted, updateCurrent, updateUpcoming, pruneData } from '../'

export async function processData (path, seasonYear, data) {
  const existingAnime = data.data.map(resource => resource.i)
  let updatedData = []

  updatedData = updatedData.concat(await updateCurrent(seasonYear))
  if (seasonYear.current) updatedData = updatedData.concat(await updateUpcoming(seasonYear))

  const currentUpcomingAnime = updatedData.map(resource => resource.id)
  const completedAnime = existingAnime.filter(id => !currentUpcomingAnime.includes(id.toString()))
  updatedData = updatedData.concat(await updateCompleted(seasonYear, completedAnime))

  const allAnime = updatedData.map(resource => resource.id)
  updatedData = await pruneData(seasonYear, updatedData)
  const prunedAnime = allAnime.filter(id => !updatedData.map(resource => resource.id).includes(id))

  // console.log(allAnime)
  console.log(prunedAnime)
  // Prune anime that have had their airdate changed to the future
  // Prune anime that finished last season or earlier

  // Map updated data to minified layout
  // Merge updated data into existing data object
  // Save to disk

  // Display stats



  // console.log('meta', data?.meta)
  // console.log(Object.keys(data).length)
  // console.log(Object.keys(data))
  // console.log('seasonYear', seasonYear)
  // console.log('updatedData', updatedData?.length)
}
