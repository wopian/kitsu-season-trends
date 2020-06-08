import { yellow, magenta } from '../'

export function seasonKind (seasonYear) {
  return seasonYear?.current ? yellow(' CURRENT') : magenta('PREVIOUS')
}
