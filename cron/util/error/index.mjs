import { bold, red, gray } from 'colorette'
import { query } from 'kitsu-core'
import { log } from '../index.mjs'

export function error (message, { url, params }) {
  const uri = decodeURI(url + query(params, true))
  log(bold(`${red('ERROR')} ${message} while requesting:\n      ${gray(uri)}`))
  process.exit(1)
}
