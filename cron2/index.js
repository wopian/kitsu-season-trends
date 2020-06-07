process.env.TZ = 'UTC'

console.log(process.env.TZ)

import { accessSeasonData } from './components'
import { seasonDataPath, currentSeasonYear, previousSeasonYear, setAuthorizationToken } from './utils'

async function runCron () {
  await setAuthorizationToken()
  accessSeasonData(seasonDataPath(currentSeasonYear()), currentSeasonYear())
  accessSeasonData(seasonDataPath(previousSeasonYear()), previousSeasonYear())
}

runCron()
