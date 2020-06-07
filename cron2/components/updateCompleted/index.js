import { API_ANIME_FIELD } from '../../constants'
import { api, info, error, seasonKind } from '../../utils'

async function getResource (id) {
  try {
    return api.get(`anime/${id}`, {
      fields: { anime: API_ANIME_FIELD }
    })
  } catch (apiError) {
    error(`requesting completed resource\n${apiError}`)
    process.exit(1)
  }
}

async function getCompleted (completedAnime) {
  let completedData = []
  for (const id of completedAnime) {
    completedData.push(await getResource(id))
  }
  return completedData
}

export async function updateCompleted (seasonYear, completedAnime) {
  info(`${seasonKind(seasonYear)} Completed`)
  const completedData = await getCompleted(completedAnime)
  info(`${seasonKind(seasonYear)} Completed ${completedData.length} resources`)
  return completedData
}
