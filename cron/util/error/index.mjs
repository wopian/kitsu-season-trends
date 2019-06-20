import chalk from 'chalk'
import { query } from 'kitsu-core/node/index.mjs'
import { log } from '../index.mjs'

export function error (message, { url, params }) {
  const uri = decodeURI(url + query(params, true))
  log(chalk`{bold.red ERROR} ${message} while requesting:`)
  log(chalk`{gray       ${uri}}`)
  process.exit(1)
}
