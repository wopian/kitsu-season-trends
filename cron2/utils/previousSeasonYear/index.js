import { currentSeasonYear } from '../'

export function previousSeasonYear () {
  const { year, season } = currentSeasonYear()
  switch (season) {
    case 'winter':
      return { current: false, season: 'autumn', year: year - 1 }
    case 'spring':
      return { current: false, season: 'winter', year }
    case 'summer':
      return { current: false, season: 'spring', year }
    case 'autumn':
      return { current: false, season: 'summer', year }
  }
}

