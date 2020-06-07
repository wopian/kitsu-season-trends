import { bold, green, blue, red } from 'colorette'

/* Log types alignment
LOADED
 SAVED
  INFO
 ERROR
*/

export const log = console.log

export function loaded (message) {
  console.log(`${bold(green('LOADED'))} ${message}`)
}

export function saved (message) {
  console.log(`${bold(green(' SAVED'))} ${message}`)
}

export function info (message) {
  console.log(`${bold(blue('  INFO'))} ${message}`)
}

export function error (message) {
  console.log(`${bold(red(' ERROR'))} ${message}`)
}
