import { yellow, magenta } from 'colorette'

export function getSeasonKind (seasonYear) {
  return seasonYear?.isCurrent ? yellow(' CURRENT') : magenta('PREVIOUS')
}
