export const previousSeason = ({ season, year }) => {
  switch (season) {
    case 'winter':
      return { season: 'autumn', year: --year }
    case 'spring':
      return { season: 'winter', year }
    case 'summer':
      return { season: 'spring', year }
    case 'autumn':
      return { season: 'summer', year }
  }
}
