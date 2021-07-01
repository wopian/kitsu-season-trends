import { blue,
  bold,
  gray,
  green,
  magenta,
  red,
  yellow } from 'colorette'

  /*
export const {
  blue,
  bold,
  gray,
  green,
  magenta,
  red,
  yellow
} = colorette
*/

/* Log types alignment
LOADED
 SAVED
  INFO
 ERROR
*/

export function log (message) {
  console.log(message)
}

export function loaded (message) {
  log(`${bold(green('LOADED'))} ${message}`)
}

export function saved (message) {
  log(`${bold(green(' SAVED'))} ${message}`)
}

export function info (message) {
  log(`${bold(blue('  INFO'))} ${message}`)
}

export function error (message) {
  return `${bold(red('ERROR'))} ${message}`
}
