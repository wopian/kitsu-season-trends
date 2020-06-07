import { yellow, magenta } from 'colorette'

export function seasonKind (seasonYear) {
  return seasonYear?.current ? yellow(' CURRENT') : magenta('PREVIOUS')
}
