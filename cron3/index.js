import { taskRunner } from './tasks'
import { getDataPath, getSeasonYear, setAuthToken } from './utils'

(async function () {
  await setAuthToken()

  const currentSeason = getSeasonYear({ isCurrent: true })
  const previousSeason = getSeasonYear({ isCurrent: false })

  taskRunner({
    path: getDataPath(currentSeason),
    seasonYear: currentSeason
  })

  /*
  taskRunner({
    path: getDataPath(getPreviousSeason()),
    seasonYear: getPreviousSeason()
  })
  */
})()
