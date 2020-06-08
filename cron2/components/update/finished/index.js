import { API_ANIME_FIELD } from '../../../constants'
import { api, info, error, seasonKind } from '../../../utils'

export async function getFinishedResource (id) {
  try {
    return api.get(`anime/${id}`, {
      fields: { anime: API_ANIME_FIELD }
    })
  } catch (apiError) {
    throw new Error(error(`requesting finished resource\n${apiError}`))
  }
}

export async function getFinished (finishedAnime = []) {
  let finishedData = []
  for (const id of finishedAnime) {
    const { data } = await getFinishedResource(id)
    finishedData.push(data)
  }

  // Kitsu API status filter is not working as expected as of March 2018
  return finishedData.filter(resource => resource.status === 'finished')
}

export async function updateFinished (seasonYear, finishedAnime) {
  info(`${seasonKind(seasonYear)} Finished`)
  const finishedData = await getFinished(finishedAnime)
  info(`${seasonKind(seasonYear)} Finished ${finishedData.length} resources`)
  return finishedData
}
