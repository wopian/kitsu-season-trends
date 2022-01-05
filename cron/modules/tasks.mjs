import { currentSeason, previousSeason } from '../utils/index.mjs'

export const tasks = {
  current: { ...currentSeason(), data: [] },
  previous: { ...previousSeason(), data: [] }
}