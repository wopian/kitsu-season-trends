import chalk from 'chalk'
import { query } from 'kitsu-core'
import { log } from '../'

export function error (message, { url, params }) {
  const uri = decodeURI(url + query(params, true))
  log(chalk`{bold.red ERROR} ${message} while requesting:`)
  log(chalk`{gray       ${uri}}`)
  process.exit(1)
}
