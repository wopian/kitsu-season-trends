import chalk from 'chalk'

export function seasonKind (seasonYear) {
  return seasonYear?.current ? chalk`{yellow  CURRENT}` : chalk`{magenta PREVIOUS}`
}
