import { API_ANIME_FIELD } from '../../constants'
import { api, info, seasonKind } from '../../utils'

async function getResource (id) {
  return api.get(`anime/${id}`, {
    fields: { anime: API_ANIME_FIELD }
  })
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
