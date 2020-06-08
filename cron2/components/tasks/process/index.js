import { updateCurrent, updateFinished, updateUpcoming } from '../../update'
import { prune, pruneExisting } from '../'
import { listIDs } from '../../../utils'

export function listFinishedIDs (data, existingIDs) {
  const currentAndUpcomingIDs = listIDs(data, 'id')
  const finishedIDs = existingIDs.filter(id => !currentAndUpcomingIDs.includes(id.toString()))
  return finishedIDs
}

export async function processFinished (seasonYear, data, existingIDs) {
  const finishedIDs = listFinishedIDs(data, existingIDs)
  return data.concat(await updateFinished(seasonYear, finishedIDs))
}

export async function process (seasonYear, data) {
  const existingIDs = listIDs(data.data, 'i')
  let updatedData = []

  updatedData = updatedData.concat(await updateCurrent(seasonYear))
  if (seasonYear.current) updatedData = updatedData.concat(await updateUpcoming(seasonYear))
  updatedData = updatedData.concat(await processFinished(seasonYear, updatedData, existingIDs))

  const prunedUpdatedData = await prune(seasonYear, updatedData)
  const prunedExistingData = await pruneExisting(data.data, updatedData)

  // const allUpdatedIDs = listIDs(updatedData, 'id')
  // const prunedUpdatedIDs = allUpdatedIDs.filter(id => !listIDs(prunedUpdatedData, 'id').includes(id))

  // console.log(allUpdatedIDs)
  // console.log(prunedUpdatedIDs)

  return { prunedExistingData, prunedUpdatedData, existingIDs }
}
