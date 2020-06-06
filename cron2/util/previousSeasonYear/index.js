import { currentSeasonYear } from '../'

export function previousSeasonYear () {
  const { year, season } = currentSeasonYear()
  switch (season) {
    case 'winter':
      return { season: 'autumn', year: year - 1 }
    case 'spring':
      return { season: 'winter', year }
    case 'summer':
      return { season: 'spring', year }
    case 'autumn':
      return { season: 'summer', year }
  }
}

