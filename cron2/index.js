process.env.TZ = 'UTC'
import { taskRunner } from './components'
import { seasonDataPath, currentSeasonYear, previousSeasonYear, setAuthorizationToken } from './utils'

async function runCron () {
  await setAuthorizationToken()
  taskRunner(seasonDataPath(currentSeasonYear()), currentSeasonYear())
  // taskRunner(seasonDataPath(previousSeasonYear()), previousSeasonYear())
}

runCron()
