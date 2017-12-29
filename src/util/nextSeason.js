export const nextSeason = ({ season, year }) => {
  switch (season) {
    case 'winter':
      return { season: 'spring', year }
    case 'spring':
      return { season: 'summer', year }
    case 'summer':
      return { season: 'autumn', year }
    case 'autumn':
      return { season: 'winter', year: ++year }
  }
}
