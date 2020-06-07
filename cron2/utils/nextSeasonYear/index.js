import { currentSeasonYear } from '../'

export function nextSeasonYear (season, year) {
  if (!season && !year) {
    const current = currentSeasonYear()
    season = current.season
    year = current.year
  }

  switch (season) {
    case 'winter':
      return { current: false, season: 'spring', year }
    case 'spring':
      return { current: false, season: 'summer', year }
    case 'summer':
      return { current: false, season: 'autumn', year }
    case 'autumn':
      return { current: false, season: 'winter', year: year + 1 }
  }
}

