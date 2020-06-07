import chalk from 'chalk'

export const { log } = console

export function loaded (message) {
  log(chalk`{bold.green LOADED} ${message}`)
}

export function saved (message) {
  console.log(chalk`{bold.green  SAVED} ${message}`)
}

export function info (message) {
  console.log(chalk`{bold.blue   INFO} ${message}`)
}

export function error (message) {
  log(chalk`{bold.red  ERROR} ${message}`)
}
