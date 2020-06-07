import { updateCompleted, updateCurrent, updateUpcoming } from '../'

export async function processData (path, seasonYear, data) {
  const existingAnime = data.data.map(val => val.i)
  let updatedData = []
  updatedData = updatedData.concat(await updateCurrent(seasonYear))
  if (seasonYear.current) updatedData = updatedData.concat(await updateUpcoming(seasonYear))
  const currentAnime = updatedData.map(resource => resource.id)
  const completedAnime = existingAnime.filter(id => !currentAnime.includes(id.toString()))
  updatedData = updatedData.concat(await updateCompleted(seasonYear, completedAnime))

  // Prune anime that have had their airdate changed to the future
  // Prune anime that finished last season or earlier

  // Display stats



  // console.log('meta', data?.meta)
  // console.log(Object.keys(data).length)
  // console.log(Object.keys(data))
  // console.log('seasonYear', seasonYear)
  // console.log('updatedData', updatedData?.length)
}
